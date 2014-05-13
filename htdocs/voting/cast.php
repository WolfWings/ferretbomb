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

	$oauth = $post['oauth'][0];
	$oauthhash = hash('sha256', $oauth);

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

	$userfind = $db->prepare('SELECT u_id FROM users WHERE __H_oauth = UNHEX(?) AND u_oauth = ?');
	$userfind->bind_param('ss', $oauthhash, $oauth);
	$userfind->execute();
	$res = $userfind->get_result();
	if ($res->num_rows === 0) {
		$twitch = json_decode(http_parse_message(http_get('https://api.twitch.tv/kraken?oauth_token=' . $oauth))->body, true);

		if (!isset($twitch['token'])
		 || !isset($twitch['token']['valid'])
		 || ($twitch['token']['valid'] !== true)) {
			$response['status_message'] = 'Invalid OAuth token.';
			return;
		}

		$username = $twitch['token']['user_name'];
		$usernamehash = hash('sha256', $username);

		// This can be replaced with a central ferretbomb auth
		// w/ scope "channel_check_subscription"
		// to '/channels/ferretbomb/subscriptions/' . $username
		$sub = 0;
		$twitch = json_decode(http_parse_message(http_get('https://api.twitch.tv/kraken/users/' . $username . '/subscriptions/ferretbomb?oauth_token=' . $oauth))->body, true);
		if (isset($twitch['channel'])) {
			$sub = 1;
		}

		$follow = 0;
		$twitch = json_decode(http_parse_message(http_get('https://api.twitch.tv/kraken/users/' . $username . '/follows/channels/ferretbomb?oauth_token=' . $oauth))->body, true);
		if (isset($twitch['channel'])) {
			$follow = 1;
		}

		// Can't use 'INSERT ... ON DUPLICATE KEY UPDATE' due to MySQL bug #30915
		$useradd = $db->prepare('INSERT INTO users (__H_oauth,u_oauth,__H_name,u_name,u_sub,u_follows) VALUES (UNHEX(?), ?, UNHEX(?), ?, IF(? = 0, NULL, ""), IF(? = 0, NULL, ""))');
		$useradd->bind_param('ssssii', $oauthhash, $oauth, $usernamehash, $username, $sub, $follow);
		if (!$useradd->execute()) {
			$useradd->close();
			$useradd = $db->prepare('UPDATE users SET __H_oauth=UNHEX(?), u_oauth=?, u_sub=IF(? = 0, NULL, ""), u_follows=IF(? = 0, NULL, "") WHERE __H_name=UNHEX(?) AND u_name=?');
			$useradd->bind_param('ssiiss', $oauthhash, $oauth, $sub, $follow, $usernamehash, $username);
			if (!$useradd->execute()) {
				$response['status_message'] = 'Unable to update existing local record for user.';
				return;
			}
		}
		$useradd->close();

//		$userfind = $db->prepare('SELECT * FROM users WHERE __H_oauth = UNHEX(?) AND u_oauth = ?');
		$userfind->bind_param('ss', $oauthhash, $oauth);
		$userfind->execute();
		$res = $userfind->get_result();
		if ($res->num_rows === 0) {
			$response['status_message'] = 'Error adding/updating local record for user.';
		}
	}

	$user = $res->fetch_assoc();
	$res->free();
	$userfind->close();

	print_r($user); echo "\n";

	$response['status_code'] = 200;
	$response['status_message'] = 'Vote successfully cast!';
}

process();

http_response_code($response['status_code']);
unset($response['status_code']);
echo json_encode($response),"\n";

?>
