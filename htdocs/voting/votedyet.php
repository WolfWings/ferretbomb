<?php

$queries = [

'user_vote' => <<<'SQL'
SELECT u_id, v_id
FROM users
LEFT JOIN votes ON users.u_id=votes._u_id
WHERE u_oauth = ?
  AND __H_oauth = UNHEX(?)
  AND (_p_id IS NULL
       OR _p_id=
         (SELECT CAST(value AS UNSIGNED INTEGER)
          FROM config
          WHERE OPTION = "poll_active"))
SQL

,

'user_insert' => <<<'SQL'
INSERT INTO users
SET __H_oauth=UNHEX(?),
      u_oauth=?,
    __H_name=UNHEX(?),
      u_name=?,
      u_sub=IF(? = 0, NULL, ""),
      u_follows=IF(? = 0, NULL, "")
SQL

,

'user_update' => <<<'SQL'
UPDATE users
SET __H_oauth=UNHEX(?),
      u_oauth=?,
      u_sub=IF(? = 0, NULL, ""),
      u_follows=IF(? = 0, NULL, "")
WHERE __H_name=UNHEX(?)
  AND u_name=?
SQL

];

$response = [
	  'status_code' => 400
	, 'status_message' => 'Unknown error!'
	, 'voted_yet' => false
];

function checkifvoted() {
	global $queries;
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

	$query = $db->prepare($queries['user_vote']);
	$query->bind_param('ss', $oauth, $oauthhash);
	$query->execute();
	$res = $query->get_result();
	if (($res === false)
	 || ($res->num_rows === 0)) {

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

		// Can't use 'INSERT ... ON DUPLICATE KEY UPDATE' due to MySQL bug #30915
		$query = $db->prepare($queries['user_insert']);
		$query->bind_param('ssssii', $oauthhash, $oauth, $usernamehash, $username, $sub, $follow);
		if (!$query->execute()) {
			$query->close();
			$query = $db->prepare($queries['user_update']);
			$query->bind_param('ssiiss', $oauthhash, $oauth, $sub, $follow, $usernamehash, $username);
			if (!$query->execute()) {
				$response['status_code'] = 500;
				$response['status_message'] = 'Unable to update pre-existing user record.';
				return;
			}
		}
		$query->close();

		$query = $db->prepare($queries['user_vote']);
		$query->bind_param('ss', $oauth, $oauthhash);
		$query->execute();
		$res = $query->get_result();
	}

	$data = $res->fetch_assoc();
	$res->free();
	$query->close();

	$response['status_code'] = 200;
	if (is_null($data['v_id'])) {
		$response['status_message'] = 'User has not voted.';
	} else {
		$response['user_voted'] = true;
		$response['status_message'] = 'User HAS voted.';
	}

	return;
}

checkifvoted();

http_response_code($response['status_code']);

echo json_encode($response);

?>
