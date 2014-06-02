DROP PROCEDURE IF EXISTS poll_find;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
PROCEDURE poll_find (
	IN oauth VARCHAR(255)
,	IN name VARCHAR(255)
)
	NOT DETERMINISTIC
	READS SQL DATA
	SQL SECURITY DEFINER
proc:BEGIN
	IF ((LENGTH(TRIM(name)) < 1)
	 || (NOT permission_poll_create(oauth)))
	THEN
		SELECT p_id AS id,p_title AS name
		  FROM polls
		 WHERE p_id IS NULL;
		LEAVE PROC;
	END IF;

	SELECT p_id AS id,p_title AS name
	  FROM polls
	 WHERE p_title LIKE CONCAT('%', name, '%')
	 LIMIT 11;
END;
~
DELIMITER ;
