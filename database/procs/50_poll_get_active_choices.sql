DROP PROCEDURE IF EXISTS poll_get_active_choices;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
PROCEDURE poll_get_active_choices (
)
	NOT DETERMINISTIC
	READS SQL DATA
	SQL SECURITY DEFINER
SELECT c_bit,p_i_id,p_i_name
  FROM choices
       INNER JOIN poll_items
               ON choices._p_i_id = poll_items.p_i_id
 WHERE _p_id =
	(SELECT CAST(value AS UNSIGNED INTEGER)
	   FROM config
	  WHERE option = "poll_active");
~
DELIMITER ;
