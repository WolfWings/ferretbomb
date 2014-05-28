DROP PROCEDURE IF EXISTS poll_create_poll_item;
DELIMITER ~
CREATE PROCEDURE poll_create_poll_item (
	IN oauth VARCHAR(255)
,	IN name VARCHAR(255)
,	OUT p_i_id INT UNSIGNED
)
	NOT DETERMINISTIC
	MODIFIES SQL DATA
proc:BEGIN
	DECLARE perm CHAR(0) DEFAULT NULL;
	SET p_i_id = 0;
	SELECT poll_create
	  INTO perm
	  FROM permissions
	 WHERE _u_id = user_find(oauth);
	IF perm IS NULL THEN
		LEAVE proc;
	END IF;

	INSERT IGNORE INTO poll_items
	   SET p_i_name = name;
	SET p_i_id = LAST_INSERT_ID();
END;
~
DELIMITER ;
