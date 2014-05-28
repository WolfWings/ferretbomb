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
	$oauthhash = hash('sha256', $oauth);

	$query = $db->prepare('SELECT user_find(?)');
	$query->bind_param('s', $oauth);
	$query->execute();
	$res = $query->get_result();
	if (($res === false)
	 || ($res->num_rows === 0)) {
		$response['unknown_oauth'] = true;
		$response['status_message'] = 'User record does not exist; hasvoted.php not called first?';
		return;
	}
	$user = $res->fetch_assoc();

	$res = $db->query('CALL poll_get_active_poll');
	if (($res === false)
	 || ($res->num_rows === 0)) {
		$response['status_message'] = 'No poll active.';
		return;
	}
	$poll = $res->fetch_assoc();
	$res->free();
	$db->next_result();

	if ((!is_null($poll['p_subonly']))
	 && (is_null($user['u_sub']))) {
		$response['status_message'] = 'Poll is subscriber-only, but user does not appear to be one.';
		$response['not_subscriber'] = true;
		return;
	}

	if (is_null($poll['p_open'])) {
		$response['status_message'] = 'Poll is not open.';
		return;
	}

	if (count($post['votes']) > 1 + $poll['p_maxchoices']) {
		$response['status_message'] = 'Too many choices in ballot.';
		return;
	}

	$res = $db->query('CALL poll_get_active_choices');
	if (($res === false)
	 || ($res->num_rows === 0)) {
		$response['status_message'] = 'No choices in active poll.';
		return;
	}
	$choices = [];
	while ($choice = $res->fetch_assoc()) {
		$choices[base_convert($choice['_p_i_id'], 10, 36)] = $choice['c_bit'];
	}
	$res->free();
	$db->next_result();

	$votes = array_fill(0, 40, false);
	foreach ($post['votes'] as $vote) {
		if (!array_key_exists($vote, $choices)) {
			$response['status_message'] = 'Invalid ballot cast for currently active poll.';
			return;
		}
		$votes[$choices[$vote]] = true;
	}

	for ($i = 0; $i < 36; $i++) {
		if ($votes[$i] === true) {
			$votes[$i] = 'v_choice_' . base_convert($i, 10, 36) . '=""';
		} else {
			$votes[$i] = null;
			unset($votes[$i]);
		}
	}

	$ip = unpack('H*', inet_pton($_SERVER['REMOTE_ADDR']))[1];
	if (strlen($ip) === 8) {
		$votes[36] = 'IPv6=NULL';
		$votes[37] = 'IPv4=UNHEX(00000000' . $ip . ')';
	} elseif (strlen($ip) === 32) {
		$votes[36] = 'IPv6=UNHEX(' . substr($ip,  0, 16) . ')';
		$votes[37] = 'IPv4=UNHEX(' . substr($ip, 16, 16) . ')';
	} else {
		$votes[36] = 'IPv6=NULL';
		$votes[37] = 'IPv4=UNHEX(FFFFFFFF00000000)';
	}

	$votes[38] = '_u_id=' . $user['u_id'];

	$votes[39] = '_p_id=' . $poll['p_id'];

	$query = 'INSERT INTO votes SET ' . join(',', $votes);

	if ($db->query($query) === false) {
		$response['status_code'] = 409;
		$response['status_message'] = 'Unable to add vote; duplicate vote?';
		return;
	}

	$response['status_code'] = 200;
	$response['vote_cast'] = true;
	$response['status_message'] = 'Vote successfully cast!';
}

process();

http_response_code($response['status_code']);

echo json_encode($response);

?>
