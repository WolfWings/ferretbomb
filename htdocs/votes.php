<?php

$results = array('rapid' => false);

function votes() {
	global $results;

	$db = new mysqli('localhost', 'ferretbomb', '', 'ferretbomb', 0, '/var/run/mysqld/mysqld.sock');

	if (mysqli_connect_errno()) {
		// Can't connect
		return;
	}

	$res = $db->query('SELECT value FROM config WHERE option = "poll_active"');
	if ($res->num_rows === 0) {
		// No poll active
		return;
	}
	$res->free();

	$results['rapid'] = true;

	$res = $db->query('SELECT * FROM polls ORDER BY p_id DESC LIMIT 1');
	if ($res->num_rows === 0) {
		// No polls
		return;
	}
	$poll = $res->fetch_assoc();
	$res->free();

	if ($poll['p_visible'] === 0) {
		// Poll not visible
		return;
	}

	$results['maxvotes'] = 1 * $poll['p_maxvotes'];

	$res = $db->query('SELECT c_bit,p_i_name FROM choices INNER JOIN poll_items ON choices._p_i_id = poll_items.p_i_id WHERE _p_id = (SELECT MAX(p_id) FROM polls)');
	if ($res->num_rows === 0) {
		// No choices in poll, not valid yet
		return;
	}

	// Store poll title in the results JSON
	$results['title'] = $poll['p_title'];

	// Store total number of votes so far
	$results['votes'] = 0;

	// Fetch all rows as we'll need them multiple times later
	$choices = $res->fetch_all(MYSQLI_ASSOC);
	$res->free();

	$results['choices'] = array();
	foreach ($choices as $choice) {
		$results['choices'][$choice['c_bit']] = array('title' => $choice['p_i_name'], 'votes' => 0);
	}

	if ($poll['p_subonly'] === 0) {
		$res = $db->query('SELECT v_choice AS bits, COUNT(*) AS votes FROM votes WHERE _p_id = (SELECT MAX(p_id) FROM polls) GROUP BY v_choice');
	} else {
		$results['subonly'] = true;
		$res = $db->query('SELECT v_choice AS bits, COUNT(*) AS votes FROM votes INNER JOIN users ON votes._u_id = users.u_id WHERE _p_id = (SELECT MAX(p_id) FROM polls) AND u_sub = 1 GROUP BY v_choice');
	}

	if ($res->num_rows === 0) {
		// No votes to tally
		return;
	}
	
	while ($vote = $res->fetch_assoc()) {
		$results['votes'] += $vote['votes'];

		foreach ($choices as $choice) {
			if ((($vote['bits'] >> $choice['c_bit']) & 1) === 1) {
				$results['choices'][$choice['c_bit']]['votes'] += $vote['votes'];
			}
		}
	}
	$res->free();
}

votes();

header('Content-Type: text/x-json');

echo json_encode($results);

?>
