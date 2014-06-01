<?php

$results = array('rapid' => false);

function votes() {
	global $results;

	$db = new mysqli('localhost', 'ferretbomb', '', 'ferretbomb');

	if (mysqli_connect_errno()) {
		$results['debug'] = 'Unable to connect to database!';
		return;
	}

	$res = $db->query('CALL active_poll_find_poll');
	if (($res === false)
	 || ($res->num_rows === 0)) {
		$results['debug'] = 'No active poll!';
		return;
	}
	$poll = $res->fetch_assoc();
	$res->free();
	$db->next_result();

	$results['rapid'] = true;

	if (is_null($poll['p_open'])) {
		$results['debug'] = 'Poll not open/visible!';
		return;
	}

	$res = $db->query('CALL active_poll_find_choices');
	if (($res === false)
	 || ($res->num_rows === 0)) {
		$results['debug'] = 'No choices in poll!';
		return;
	}

	$results['maxchoices'] = (int) $poll['p_maxchoices'];

	// Store poll title in the results JSON
	$results['title'] = $poll['p_title'];

	// Store total number of votes so far
	$results['ballots'] = 0;

	$results['choices'] = array();
	while ($choice = $res->fetch_assoc()) {
		$bit = base_convert($choice['c_bit'], 10, 36);
		$results['choices'][$choice['c_bit']] = array(
			  'title' => $choice['p_i_name']
			, 'votes' => 0
			, 'box' => base_convert($choice['p_i_id'], 10, 36)
			);
	}
	$res->free();
	$db->next_result();

	$res = $db->query('CALL active_poll_find_vote_totals');
	if (($res === false)
	 || ($res->num_rows === 0)) {
		$results['debug'] = 'No votes to tally!';
		return;
	}

	$votes = $res->fetch_assoc();
	$res->free();
	$db->next_result();

	foreach (array_keys($results['choices']) as $rawbit) {
		$bit = base_convert($rawbit, 10, 36);
		$results['choices'][$bit]['votes'] = $votes[$bit];
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
