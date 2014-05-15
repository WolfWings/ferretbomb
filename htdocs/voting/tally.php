<?php

$results = array('rapid' => false);

function votes() {
	global $results;

	$db = new mysqli('localhost', 'ferretbomb', '', 'ferretbomb');

	if (mysqli_connect_errno()) {
		// Can't connect
		return;
	}

	$res = $db->query('SELECT * FROM polls WHERE p_id = (SELECT CAST(value AS UNSIGNED INTEGER) FROM config WHERE option = "poll_active")');
	if (($res === false)
	 || ($res->num_rows === 0)) {
		// No poll matching poll_active, and/or no poll_active/polls
		return;
	}
	$poll = $res->fetch_assoc();
	$res->free();

	$results['rapid'] = true;

	if ($poll['p_open'] === NULL) {
		// Poll not open/visible
		return;
	}

	$results['maxchoices'] = (int) $poll['p_maxchoices'];

	$res = $db->query('SELECT c_bit,p_i_id,p_i_name FROM choices INNER JOIN poll_items ON choices._p_i_id = poll_items.p_i_id WHERE _p_id = (SELECT CAST(value AS UNSIGNED INTEGER) FROM config WHERE option = "poll_active")');
	if (($res === false)
	 || ($res->num_rows === 0)) {
		// No choices in poll, not valid yet
		return;
	}

	// Store poll title in the results JSON
	$results['title'] = $poll['p_title'];

	// Store total number of votes so far
	$results['ballots'] = 0;

	// Fetch all rows as we'll need them multiple times later
	$choices = $res->fetch_all(MYSQLI_ASSOC);
	$res->free();

	$query = [];
	$results['choices'] = array();
	foreach ($choices as $choice) {
		$bit = base_convert($choice['c_bit'], 10, 36);
		array_push($query, 'COUNT(v_choice_' . $bit . ') AS `' . $bit . '`');
		$results['choices'][$choice['c_bit']] = array(
			  'title' => $choice['p_i_name']
			, 'votes' => 0
			, 'box' => base_convert($choice['p_i_id'], 10, 36)
			);
	}
	$query = 'SELECT ' . join(', ', $query) . ' FROM votes';
	if ($poll['p_subonly'] !== NULL) {
		$results['subonly'] = true;
		$query .= ' INNER JOIN users ON votes._u_id = users.u_id';
	}
	$query .= ' WHERE _p_id = (SELECT CAST(value AS UNSIGNED INTEGER) FROM config WHERE option = "poll_active")';
	if ($poll['p_subonly'] !== NULL) {
		$query .= ' AND u_sub IS NOT NULL';
	}

	$res = $db->query($query);

	if (($res === false)
	 || ($res->num_rows === 0)) {
		// No votes to tally
		return;
	}

	$votes = $res->fetch_assoc();
	$res->free();

	foreach ($votes as $vote => $tally) {
		$results['ballots'] += $tally;
		$results['choices'][base_convert($vote, 36, 10)]['votes'] = $tally;
	}
}

function choice_compare($a, $b) {
	return strcasecmp($a['title'], $b['title']);
}

votes();

if (isset($results['choices'])) {
	usort($results['choices'], 'choice_compare');
}

header('Content-Type: text/x-json');

echo json_encode($results);

?>
