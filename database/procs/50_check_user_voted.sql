DROP PROCEDURE IF EXISTS check_user_voted;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
PROCEDURE check_user_voted (
	IN u_id INT UNSIGNED
)
	NOT DETERMINISTIC
	READS SQL DATA
	SQL SECURITY DEFINER
SELECT COUNT(p_id) AS polls, COUNT(v_id) AS voted
  FROM polls
       LEFT JOIN votes
              ON polls.p_id = votes._p_id
 WHERE p_id =
	(SELECT CAST(value AS UNSIGNED INTEGER)
	   FROM config
	  WHERE option = "poll_active")
   AND (   (_u_id IS NULL)
        OR (_u_id = u_id)
       );
~
DELIMITER ;
