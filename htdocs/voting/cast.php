<?php

$response = [
	  'status_code' => 400
	, 'status_message' => 'Unknown error!'
];

function process() {
	global $response;

	$p = file_get_contents('php://input');
	if (preg_match('[^a-zA-Z0-9&=]', $p)) {
		$response['status_message'] = 'Invalid characters detected in form data.';
		return;
	}

	$post = [];
	foreach (explode('&', $p) as $v) {
		$kv = explode('=', $v, 2);
		if (count($kv) == 2) {
			if (!isset($post[$kv[0]])) {
				$post[$kv[0]] = [$kv[1]];
			} else {
				array_push($post[$kv[0]], $kv[1]);
			}
		}
	}

	if (!isset($post['votes'])) {
		$response['status_message'] = 'Missing votes to cast.';
		return;
	}

	if (!isset($post['oauth'])
	 || (count($post['oauth']) > 1)
	 || (strlen($post['oauth'][0]) > 255)) {
		$response['status_message'] = 'Missing/invalid OAuth parameter(s).';
		return;
	}

	$db = new mysqli('localhost', 'ferretbomb', '', 'ferretbomb');
	if (mysqli_connect_errno()) {
		$response['status_code'] = 500;
		$response['status_message'] = 'Unable to connect to database.';
		return;
	}

	$oauth = $post['oauth'][0];

	$votes = [];
	foreach ($post['votes'] as $vote) {
		array_push($votes, $vote);
	}
	$votes = join('_', $votes);

	$ip = unpack('H*', inet_pton($_SERVER['REMOTE_ADDR']))[1];

	$response['debug'] = [
		'oauth' => $oauth
	,	'votes' => $votes
	,	'ip' => $ip
	];

	$res = $db->query('SET @message = \'\'');
	if ($res === FALSE) {
		$response['status_code'] = 500;
		$response['status_message'] = 'Unable to create database session variable.';
		return;
	}

	$query = $db->prepare('CALL poll_cast_vote(?,?,?,@message)');
	$query->bind_param('sss', $oauth, $votes, $ip);
	$query->execute();
	$query->close();

	$res = $db->query('SELECT @message AS message');
	if ($res === FALSE) {
		$response['status_code'] = 500;
		$response['status_message'] = 'Unable to fetch database session variable.';
		return;
	}

	$response = $res->fetch_assoc();
	$res->free();

	$response['status_message'] = $response['message'];

	switch ($response['message']) {
		case 'Casting vote.':
			$response['status_code'] = 500;
			$response['status_message'] = 'Unable to cast vote.';
			break;
		case 'Vote cast.':
			$response['status_code'] = 200;
			$response['vote_cast'] = true;
			break;
	}
}

process();

http_response_code($response['status_code']);

echo json_encode($response);

?>
