DROP PROCEDURE IF EXISTS poll_get_active_poll;
DELIMITER ~
CREATE PROCEDURE poll_get_active_poll (
)
	NOT DETERMINISTIC
	READS SQL DATA
SELECT *
  FROM polls
 WHERE p_id =
	(SELECT CAST(value AS UNSIGNED INTEGER)
	   FROM config
	  WHERE option = "poll_active");
~
DELIMITER ;
