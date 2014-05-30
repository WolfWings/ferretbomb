DROP PROCEDURE IF EXISTS poll_create_poll;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
PROCEDURE poll_create_poll (
	IN oauth VARCHAR(255)
,	IN title VARCHAR(255)
,	OUT p_id INT UNSIGNED
)
	NOT DETERMINISTIC
	MODIFIES SQL DATA
	SQL SECURITY DEFINER
proc:BEGIN
	DECLARE perm CHAR(0) DEFAULT NULL;
	SET p_id = 0;
	SELECT poll_create
	  INTO perm
	  FROM permissions
	 WHERE _u_id = user_find(oauth);
	IF perm IS NULL THEN
		LEAVE proc;
	END IF;

	INSERT IGNORE INTO polls
	   SET p_title = title;
	SET p_id = LAST_INSERT_ID();
END;
~
DELIMITER ;
