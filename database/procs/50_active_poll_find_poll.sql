DROP PROCEDURE IF EXISTS poll_get_active_poll;
DROP PROCEDURE IF EXISTS active_poll_find_poll;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
PROCEDURE active_poll_find_poll (
)
	NOT DETERMINISTIC
	READS SQL DATA
	SQL SECURITY DEFINER
SELECT *
  FROM polls
 WHERE p_id =
	(SELECT CAST(value AS UNSIGNED INTEGER)
	   FROM config
	  WHERE option = "poll_active");
~
DELIMITER ;
