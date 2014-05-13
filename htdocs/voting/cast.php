<?php

$response = array('status_code' => 400, 'status_message' => 'Unknown error!');

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

	if (!isset($post['oauth'])
	 || (count($post['oauth']) > 1)
	 || (strlen($post['oauth'][0]) > 255)) {
		$response['status_message'] = 'Missing or invalid OAuth token.';
		return;
	}

	if (!isset($post['votes'])) {
		$response['status_message'] = 'Missing votes to cast.';
		return;
	}

	$db = new mysqli('localhost', 'ferretbomb', '', 'ferretbomb');
	if (mysqli_connect_errno()) {
		$response['status_code'] = 500;
		$response['status_message'] = 'Unable to connect to database.';
		return;
	}

	$userfind = $db->prepare('SELECT * FROM users WHERE __H_oauth = UNHEX(SHA2(?, 256)) AND u_oauth = ?');
	$userfind->bind_param('ss', $post['oauth'][0], $post['oauth'][0]);
	$userfind->execute();
	$res = $userfind->get_result();
	if ($res->num_rows === 0) {
		$twitch = json_decode(http_parse_message(http_get('https://api.twitch.tv/kraken?oauth_token=' . $post['oauth'][0]))->body, true);
		if (!isset($twitch['token'])
		 || !isset($twitch['token']['valid'])
		 || ($twitch['token']['valid'] !== true)) {
			$response['status_message'] = 'Invalid OAuth token.';
			return;
		}

		print_r($twitch);

		$user = json_decode(http_parse_message(http_get('https://api.twitch.tv/kraken/users/' . $twitch['token']['user_name'] . '/subscriptions/lethalfrag?oauth_token=' . $post['oauth'][0]))->body, true);

		print_r($user);
	}

	$response['status_code'] = 200;
	$response['status_message'] = 'Vote successfully cast!';
}

process();

http_response_code($response['status_code']);
unset($response['status_code']);
echo json_encode($response);

?>
