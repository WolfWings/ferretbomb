DROP PROCEDURE IF EXISTS poll_delete_poll_choice;
DELIMITER ~
CREATE PROCEDURE poll_delete_poll_choice (
	IN oauth VARCHAR(255)
,	IN p_id INT UNSIGNED
,	IN p_i_id INT UNSIGNED
)
	NOT DETERMINISTIC
	MODIFIES SQL DATA
proc:BEGIN
	DECLARE perm CHAR(0) DEFAULT NULL;
	SELECT poll_create
	  INTO perm
	  FROM permissions
	 WHERE _u_id = user_find(oauth);
	IF perm IS NULL THEN
		LEAVE proc;
	END IF;

	DELETE IGNORE FROM choices
	 WHERE _p_id = p_id
	   AND _p_i_id = p_i_id;
END;
~
DELIMITER ;
