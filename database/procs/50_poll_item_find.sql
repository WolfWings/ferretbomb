DROP FUNCTION IF EXISTS poll_find_poll_item;
DROP PROCEDURE IF EXISTS poll_item_find;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
PROCEDURE poll_item_find (
	IN oauth VARCHAR(255)
,	IN name VARCHAR(255)
)
	NOT DETERMINISTIC
	READS SQL DATA
	SQL SECURITY DEFINER
proc:BEGIN
	DECLARE perm CHAR(0) DEFAULT NULL;

	IF LENGTH(TRIM(name)) < 1 THEN
		SELECT p_i_id AS id,p_i_name AS name
		  FROM poll_items
		 WHERE p_i_id IS NULL;
		LEAVE PROC;
	END IF;

	SELECT poll_create
	  INTO perm
	  FROM permissions
	 WHERE _u_id = user_find(oauth);

	IF perm IS NULL THEN
		SELECT p_i_id AS id,p_i_name AS name
		  FROM poll_items
		 WHERE p_i_id IS NULL;
		LEAVE PROC;
	END IF;

	SELECT p_i_id AS id,p_i_name AS name
	  FROM poll_items
	 WHERE p_i_name LIKE CONCAT('%', name, '%')
	 LIMIT 11;
END;
~
DELIMITER ;
