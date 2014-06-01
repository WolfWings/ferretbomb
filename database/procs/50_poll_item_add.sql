DROP PROCEDURE IF EXISTS poll_create_poll_item;
DROP PROCEDURE IF EXISTS poll_item_add;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
PROCEDURE poll_item_add (
	oauth VARCHAR(255)
,	name VARCHAR(255)
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
		SELECT NULL AS id;
		LEAVE proc;
	END IF;

	INSERT IGNORE INTO poll_items
	   SET p_i_name = name;
	SELECT LAST_INSERT_ID() AS id;
END;
~
DELIMITER ;
