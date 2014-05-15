<?php

$queries = [

'uservote' => <<<'SQL'
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

'userinsert' => <<<'SQL'
INSERT INTO users
SET __H_oauth=UNHEX(?),
      u_oauth=?,
    __H_name=UNHEX(?),
      u_name=?,
      u_sub=IF(? = 0, NULL, ""),
      u_follows=IF(? = 0, NULL, "")
SQL

,

'userupdate' => <<<'SQL'
UPDATE users
SET __H_oauth=UNHEX(?),
      u_oauth=?,
      u_sub=IF(? = 0, NULL, ""),
      u_follows=IF(? = 0, NULL, "")
WHERE __H_name=UNHEX(?)
  AND u_name=?
SQL

];

function checkifvoted() {
	global $queries;

	if (!isset($_GET['oauth'])
	 || preg_match('[^a-zA-Z0-9]', $_GET['oauth'])) {
		// No OAuth string included
		return false;
	}

	$oauth = $_GET['oauth'];
	$oauthhash = hash('sha256', $oauth);

	$db = new mysqli('localhost', 'ferretbomb', '', 'ferretbomb');
	if (mysqli_connect_errno()) {
		// Unable to connect to database
		return false;
	}

	$query = $db->prepare($queries['uservote']);
	$query->bind_param('ss', $oauth, $oauthhash);
	$query->execute();
	$res = $query->get_result();
	if (($res === false)
	 || ($res->num_rows === 0)) {

		$twitch = json_decode(http_parse_message(http_get('https://api.twitch.tv/kraken?oauth_token=' . $oauth))->body, true);

		if (!isset($twitch['token'])
		 || !isset($twitch['token']['valid'])
		 || ($twitch['token']['valid'] !== true)) {
			// Invalid OAuth token
			return false;
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
		$query = $db->prepare($queries['userinsert']);
		$query->bind_param('ssssii', $oauthhash, $oauth, $usernamehash, $username, $sub, $follow);
		if (!$query->execute()) {
			$query->close();
			$query = $db->prepare($queries['userupdate']);
			$query->bind_param('ssiiss', $oauthhash, $oauth, $sub, $follow, $usernamehash, $username);
			if (!$query->execute()) {
				// Unable to update existing local record for user
				return false;
			}
		}
		$query->close();

		// User not in list, can't have voted
		return false;
	}

	$data = $res->fetch_assoc();
	$res->free();
	$query->close();

	return (!is_null($data['v_id']));
}

echo json_encode(checkifvoted());

?>
