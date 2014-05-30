<?php

$response = [
	  'status_code' => 400
	, 'status_message' => 'Unknown error!'
	, 'user_voted' => false
];

function checkifvoted() {
	global $response;

	if (!isset($_GET['oauth'])
	 || preg_match('[^a-zA-Z0-9]', $_GET['oauth'])
	 || (strlen($_GET['oauth']) > 255)) {
		$response['status_message'] = 'Missing or invalid OAuth parameter.';
		return;
	}

	$oauth = $_GET['oauth'];
	$oauthhash = hash('sha256', $oauth);

	$db = new mysqli('localhost', 'ferretbomb', '', 'ferretbomb');
	if (mysqli_connect_errno()) {
		$response['status_code'] = 500;
		$response['status_message'] = 'Unable to connect to database.';
		return;
	}

	$query = $db->prepare('SELECT user_find(?)');
	$query->bind_param('s', $oauth);
	$query->execute();
	$res = $query->get_result();
	if (($res === false)
	 || ($res->num_rows === 0)) {
		if ($res !== false) {
			$res->free();
		}
		$query->close();

		$twitch = json_decode(http_parse_message(http_get('https://api.twitch.tv/kraken?oauth_token=' . $oauth))->body, true);

		if (!isset($twitch['token'])
		 || !isset($twitch['token']['valid'])
		 || ($twitch['token']['valid'] !== true)) {
			$response['status_message'] = 'Invalid OAuth token.';
			$response['invalid_oauth'] = true;
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
			$response['user_subscriber'] = true;
			$sub = 1;
		}

		$follow = 0;
		$twitch = json_decode(http_parse_message(http_get('https://api.twitch.tv/kraken/users/' . $username . '/follows/channels/ferretbomb?oauth_token=' . $oauth))->body, true);
		if (isset($twitch['channel'])) {
			$response['user_follower'] = true;
			$follow = 1;
		}

		$query = $db->prepare('CALL user_update(?, ?, ?, ?)');
		$query->bind_param('ssii', $username, $oauth, $sub, $follow);
		if (!$query->execute()) {
			$response['status_code'] = 500;
			$response['status_message'] = 'Unable to update pre-existing user record.';
			return;
		}
		$query->close();
		$db->next_result();

		$query = $db->prepare('SELECT user_find(?)');
		$query->bind_param('s', $oauth);
		$query->execute();
		$res = $query->get_result();

		if (($res === false)
		 || ($res->num_rows === 0)) {
			$response['status_code'] = 500;
			$response['status_message'] = 'Unable to find user record after creation/update.';
			return;
		}
	}

	$user = $res->fetch_assoc();
	$res->free();
	$query->close();

	$response['status_code'] = 200;

	$response['status_message'] = 'User has not voted.';

	$query = $db->prepare('CALL check_user_voted(?)');
	$query->bind_param('i', $user['u_id']);
	$query->execute();
	$res = $query->get_result();
	if (($res === false)
	 || ($res->num_rows === 0)) {
		return;
	}
	$status = $res->fetch_assoc();
	$response['user_voted'] = ($status['voted'] === 1);
	$response['poll_active'] = ($status['polls'] === 1);
	if ($response['user_voted']) {
		$response['status_message'] = 'User HAS voted.';
	}
}

checkifvoted();

http_response_code($response['status_code']);

echo json_encode($response);

?>
