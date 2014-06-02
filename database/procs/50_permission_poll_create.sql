DROP FUNCTION IF EXISTS permission_poll_create;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
FUNCTION permission_poll_create (
	oauth VARCHAR(255)
)
	RETURNS INT UNSIGNED
	NOT DETERMINISTIC
	READS SQL DATA
	SQL SECURITY DEFINER
BEGIN
	DECLARE perm CHAR(0) DEFAULT NULL;

	SELECT poll_create
	  INTO perm
	  FROM permissions
	 WHERE _u_id = user_find(oauth);

	RETURN (perm IS NOT NULL);
END;
~
DELIMITER ;
