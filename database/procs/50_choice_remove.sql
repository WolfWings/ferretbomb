DROP PROCEDURE IF EXISTS poll_delete_poll_choice;
DROP PROCEDURE IF EXISTS choice_remove;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
PROCEDURE choice_remove (
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

	DELETE IGNORE FROM choices
	 WHERE _p_id = p_id
	   AND _p_i_id = p_i_id;
END;
~
DELIMITER ;
