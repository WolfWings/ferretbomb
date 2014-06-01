DROP PROCEDURE IF EXISTS poll_create_poll;
DROP PROCEDURE IF EXISTS poll_create;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
PROCEDURE poll_create (
	IN oauth VARCHAR(255)
,	IN title VARCHAR(255)
)
	NOT DETERMINISTIC
	MODIFIES SQL DATA
	SQL SECURITY DEFINER
proc:BEGIN
	DECLARE perm CHAR(0) DEFAULT NULL;
	SELECT poll_create
	  INTO perm
	  FROM permissions
	 WHERE _u_id = user_find(oauth);
	IF perm IS NULL THEN
		SELECT NULL;
		LEAVE proc;
	END IF;

	INSERT IGNORE INTO polls
	   SET p_title = title;
	SELECT LAST_INSERT_ID();
END;
~
DELIMITER ;
