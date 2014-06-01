<?php

$response = [
	  'status_code' => 400
	, 'status_message' => 'Unknown error!'
	, 'poll_items' => []
];

function searchpollitems() {
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

	$query = $db->prepare('CALL poll_item_find(?,?)');
	$query->bind_param('ss', $oauth, $search);
	$query->execute();
	$res = $query->get_result();

	$response['status_code'] = 200;

	if (($res === false)
	 || ($res->num_rows === 0)) {
		$response['status_message'] = 'No poll items found.';
		return;
	}

	if ($res->num_rows > 10) {
		$response['status_message'] = 'Too many poll items found.';
		return;
	}

	$response['status_message'] = 'Poll items found.';

	while ($poll_item = $res->fetch_assoc()) {
		array_push($response['poll_items'], $poll_item);
		unset($response['status_message']);
	}
	$res->free();
	$db->next_result();
}

searchpollitems();

http_response_code($response['status_code']);

echo json_encode($response);

?>
