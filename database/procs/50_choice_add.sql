DROP PROCEDURE IF EXISTS poll_add_poll_choice;
DROP PROCEDURE IF EXISTS choice_add;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
PROCEDURE choice_add (
	IN oauth VARCHAR(255)
,	IN p_id INT UNSIGNED
,	IN p_i_id INT UNSIGNED
)
	NOT DETERMINISTIC
	MODIFIES SQL DATA
	SQL SECURITY DEFINER
proc:BEGIN
	IF NOT permission_poll_create(oauth) THEN
		LEAVE proc;
	END IF;

	INSERT IGNORE INTO choices
	   SET _p_id = p_id
	     , _p_i_id = p_i_id
	     , c_bit =
		(SELECT MIN(value)
		   FROM sequence
		  WHERE value BETWEEN 0 AND 35
		    AND value NOT IN
			(SELECT c_bit
			   FROM choices
			  WHERE _p_id = p_id) );
END;
~
DELIMITER ;
