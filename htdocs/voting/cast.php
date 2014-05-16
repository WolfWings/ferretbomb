<?php

define('QUERY_POLL_ACTIVE', <<<'SQL'
SELECT p_id,
       p_maxchoices,
       p_subonly,
       p_open
  FROM polls
 WHERE p_id =
	(SELECT CAST(value AS UNSIGNED INTEGER)
	   FROM config
	  WHERE OPTION = "poll_active")
SQL
);

define('QUERY_POLL_CHOICES', <<<'SQL'
SELECT c_bit,_p_i_id
  FROM choices
 WHERE _p_id =
	(SELECT CAST(value AS UNSIGNED INTEGER)
	   FROM config
	  WHERE OPTION = "poll_active")
SQL
);

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
		$kv = null;
		unset($kv);
	}
	$v = null;
	unset($v);
	$p = null;
	unset($p);

	if (!isset($post['votes'])) {
		$response['status_message'] = 'Missing votes to cast.';
		return;
	}

	if (!isset($post['oauth'])
	 || (count($post['oauth']) > 1)
	 || (strlen($post['oauth'][0]) > 255)) {
		$response['status_message'] = 'Missing or invalid OAuth parameter.';
		return;
	}

	$db = new mysqli('localhost', 'ferretbomb', '', 'ferretbomb');
	if (mysqli_connect_errno()) {
		$response['status_code'] = 500;
		$response['status_message'] = 'Unable to connect to database.';
		return;
	}

	$res = $db->query(QUERY_POLL_ACTIVE);
	if (($res === false)
	 || ($res->num_rows === 0)) {
		$response['status_message'] = 'No poll active.';
		return;
	}
	$poll = $res->fetch_assoc();
	$res->free();
	$res = null;
	unset($res);

	if (is_null($poll['p_open'])) {
		$response['status_message'] = 'Poll is not open.';
		return;
	}

	if (count($post['votes']) > 1 + $poll['p_maxchoices']) {
		$response['status_message'] = 'Too many choices in ballot.';
		return;
	}

	$res = $db->query(QUERY_POLL_CHOICES);
	if (($res === false)
	 || ($res->num_rows === 0)) {
		$response['status_message'] = 'No choices in active poll.';
		return;
	}
	$choices = [];
	while ($choice = $res->fetch_assoc()) {
		$choices[base_convert($choice['_p_i_id'], 10, 36)] = $choice['c_bit'];
	}
	unset($choice);
	$res->free();
	$res = null;
	unset($res);

	$votes = array_fill(0, 36, false);
	foreach ($post['votes'] as $vote) {
		if (!array_key_exists($vote, $choices)) {
			$response['status_message'] = 'Invalid ballot cast for currently active poll.';
			return;
		}
		$votes[$choices[$vote]] = true;
	}
	$vote = null;
	unset($vote);
	$choices = null;
	unset($choices);

	for ($i = 0; $i < 36; $i++) {
		if ($votes[$i] === true) {
			$votes[$i] = 'v_choice_' . base_convert($i, 10, 36) . '=""';
		} else {
			$votes[$i] = null;
			unset($votes[$i]);
		}
	}
	$i = null;
	unset($i);

	$oauth = $post['oauth'][0];
	$post = null;
	unset($post);

	$oauthhash = hash('sha256', $oauth);

	$userfind = $db->prepare('SELECT u_id FROM users WHERE __H_oauth = UNHEX(?) AND u_oauth = ?');
	$userfind->bind_param('ss', $oauthhash, $oauth);
	$userfind->execute();
	$res = $userfind->get_result();
	if (($res === false)
	 || ($res->num_rows === 0)) {
		$response['status_message'] = 'User record does not exist; hasvoted.php not called first?';
		return;
	}
	$oauthhash = null;
	unset($oauthhash);
	$oauth = null;
	unset($oauth);

	$user = $res->fetch_assoc();
	$res->free();
	$res = null;
	unset($res);

	$userfind->close();
	$userfind = null;
	unset($userfind);

	$ip = unpack('H*', inet_pton($_SERVER['REMOTE_ADDR']))[1];
	if (strlen($ip) === 8) {
		array_push($votes, 'IPv6=NULL');
		array_push($votes, 'IPv4=UNHEX(' . $ip . ')');
	} elseif (strlen($ip) === 32) {
		array_push($votes, 'IPv6=UNHEX(' . substr($ip, 0, 16) . ')');
		array_push($votes, 'IPv4=UNHEX(' . substr($ip, 16, 16) . ')');
	}
	$ip = null;
	unset($ip);

	array_push($votes, '_u_id=' . $user['u_id']);
	$user = null;
	unset($user);

	array_push($votes, '_p_id=' . $poll['p_id']);
	$poll = null;
	unset($poll);

	$query = 'INSERT INTO votes SET ' . join(',', $votes);
	$votes = null;
	unset($votes);

	if ($db->query($query) === false) {
		$response['status_message'] = 'Unable to add vote; duplicate vote?';
		return;
	}
	$db->close();
	$db = null;
	unset($db);

	$response['status_code'] = 200;
	$response['status_message'] = 'Vote successfully cast!';
}

process();

http_response_code($response['status_code']);

echo json_encode($response);

?>
