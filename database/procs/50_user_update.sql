DROP PROCEDURE IF EXISTS user_update;
DELIMITER ~
CREATE PROCEDURE user_update (
	IN name VARCHAR(255)
,	IN oauth VARCHAR(255)
,	IN subscriber TINYINT UNSIGNED
,	IN follower TINYINT UNSIGNED
)
	NOT DETERMINISTIC
	MODIFIES SQL DATA
proc:BEGIN
	DECLARE HASHoauth BINARY(32);
	DECLARE HASHname BINARY(32);

	IF name IS NULL THEN
		LEAVE proc;
	END IF;
	IF oauth IS NULL THEN
		LEAVE proc;
	END IF;

	SET HASHoauth = UNHEX(SHA2(oauth, 256));
	SET HASHname = UNHEX(SHA2(name, 256));

	INSERT IGNORE INTO users
	   SET __H_name = HASHname
	     , u_name = name;

	UPDATE users
	   SET __H_oauth = HASHoauth
	     , u_oauth = oauth
	     , u_sub = IF(subscriber = 0, NULL, "")
	     , u_follows = IF(follower = 0, NULL, "")
	 WHERE __H_name = HASHname
	   AND u_name = name;
END;
~
DELIMITER ;
