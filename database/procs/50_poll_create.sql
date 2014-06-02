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
	IF NOT permission_poll_create(oauth) THEN
		SELECT NULL;
		LEAVE proc;
	END IF;

	INSERT IGNORE INTO polls
	   SET p_title = title;
	SELECT LAST_INSERT_ID();
END;
~
DELIMITER ;
