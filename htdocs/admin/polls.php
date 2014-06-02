<?php

$response = [
	  'status_code' => 400
	, 'status_message' => 'Unknown error!'
	, 'items' => []
];

function searchpolls() {
	global $response;

	if (!isset($_GET['oauth'])
	 || preg_match('[^a-zA-Z0-9]', $_GET['oauth'])
	 || (strlen($_GET['oauth']) > 255)) {
		$response['status_message'] = 'Missing or invalid OAuth parameter.';
		return;
	}

	if (!isset($_GET['search'])
	 || (strlen($_GET['search']) > 255)) {
		$response['status_message'] = 'Missing or invalid Search parameter.';
		return;
	}

	$oauth = $_GET['oauth'];
	$search = $_GET['search'];

	$db = new mysqli('localhost', 'ferretbomb', '', 'ferretbomb');
	if (mysqli_connect_errno()) {
		$response['status_code'] = 500;
		$response['status_message'] = 'Unable to connect to database.';
		return;
	}

	$query = $db->prepare('CALL poll_find(?,?)');
	$query->bind_param('ss', $oauth, $search);
	$query->execute();
	$res = $query->get_result();

	$response['status_code'] = 200;

	if (($res === false)
	 || ($res->num_rows === 0)) {
		$response['status_message'] = 'No polls found.';
		return;
	}

	if ($res->num_rows > 10) {
		$response['too_many_found'] = true;
		$response['status_message'] = 'Too many polls found.';
		$response['items'] = false;
		return;
	}

	$response['status_message'] = 'Polls found.';

	while ($poll = $res->fetch_assoc()) {
		array_push($response['items'], $poll);
		unset($response['status_message']);
	}
	$res->free();
	$db->next_result();
}

searchpolls();

http_response_code($response['status_code']);

echo json_encode($response);

?>
