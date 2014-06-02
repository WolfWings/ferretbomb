DROP PROCEDURE IF EXISTS poll_create_poll_item;
DROP PROCEDURE IF EXISTS poll_item_add;
DROP PROCEDURE IF EXISTS poll_item_create;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
PROCEDURE poll_item_create (
	oauth VARCHAR(255)
,	name VARCHAR(255)
)
	NOT DETERMINISTIC
	MODIFIES SQL DATA
	SQL SECURITY DEFINER
proc:BEGIN
	IF NOT permission_poll_create(oauth) THEN
		SELECT NULL AS id;
		LEAVE proc;
	END IF;

	INSERT IGNORE INTO poll_items
	   SET p_i_name = name;
	SELECT LAST_INSERT_ID() AS id;
END;
~
DELIMITER ;
