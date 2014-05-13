<?php

function checkifvoted() {
	if (!isset($_GET['oauth'])
	 || preg_match('[^a-zA-Z0-9]', $_GET['oauth'])) {
		// No OAuth string included
		return false;
	}

	$db = new mysqli('localhost', 'ferretbomb', '', 'ferretbomb');
	if (mysqli_connect_errno()) {
		// Unable to connect to database
		return false;
	}

	$userfind = $db->prepare('SELECT * FROM votes INNER JOIN users ON votes._u_id=users.u_id INNER JOIN polls ON votes._p_id=polls.p_id WHERE _u_id = (SELECT u_id FROM users WHERE __H_oauth = UNHEX(SHA2(?, 256)) AND u_oauth = ?) AND _p_id = (SELECT CAST(value AS UNSIGNED INTEGER) FROM config WHERE option = "poll_active")');
	$userfind->bind_param('ss', $_GET['oauth'], $_GET['oauth']);
	$userfind->execute();
	$res = $userfind->get_result();
	if ($res->num_rows === 0) {
		// User not in list, can't have voted
		return false;
	}
	$row = $res->fetch_assoc();
	var_dump($row);
	$res->free();

	return true;
}

echo json_encode(checkifvoted());

?>