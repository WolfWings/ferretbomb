<?php

if (!isset($_POST['oauth'])
 || !preg_match('^[a-z0-9A-Z]+$', $_POST['oauth'])
 || !isset($_POST['vote'])
 || !preg_match('^[a-z0-9_]+$', $_POST['vote'])
   ) {
	echo 'Incorrect values passed to attempt to cast vote.',"\n";
	exit();
}

$db = new mysqli('localhost', 'ferretbomb', '', 'ferretbomb', 0, '/var/run/mysqld/mysqld.sock');

$res = $db->query('SELECT u_id WHERE __H_oauth = SHA2(' + $_POST['oauth'] + ',2)');
if ($res->num_rows === 0) {
	// User not in table, need to ping Twitch...
	echo 'User not known, need to add...',"\n";
	exit();
}

echo 'User found, adding vote...',"\n";
exit();

?>
