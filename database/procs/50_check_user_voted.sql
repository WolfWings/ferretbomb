DROP PROCEDURE IF EXISTS check_user_voted;
DELIMITER ~
CREATE PROCEDURE check_user_voted (
	IN u_id INT UNSIGNED
)
	NOT DETERMINISTIC
	READS SQL DATA
SELECT v_id
  FROM votes
 WHERE _u_id = u_id
   AND _p_id =
	(SELECT CAST(value AS UNSIGNED INTEGER)
	   FROM config
	  WHERE option = "poll_active");
~
DELIMITER ;
