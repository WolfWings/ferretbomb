DROP PROCEDURE IF EXISTS poll_cast_vote;
DELIMITER ~
CREATE DEFINER = 'ferretadmin'@'localhost'
PROCEDURE poll_cast_vote (
	IN oauth VARCHAR(255)
,	IN votes VARCHAR(255)
,	IN fromIP VARCHAR(32)
,	OUT response VARCHAR(255)
)
	NOT DETERMINISTIC
	MODIFIES SQL DATA
	SQL SECURITY DEFINER
proc:BEGIN
	DECLARE user INT UNSIGNED;
	DECLARE vote TINYINT UNSIGNED;
	DECLARE poll INT UNSIGNED;
	DECLARE choices INT UNSIGNED DEFAULT 0;
	DECLARE IPv6 BIGINT UNSIGNED;
	DECLARE IPv4 BIGINT UNSIGNED;
	DECLARE u_sub CHAR(0) DEFAULT NULL;
	DECLARE p_sub CHAR(0) DEFAULT NULL;

	IF ((LENGTH(fromIP) != 8) &&
	    (LENGTH(fromIP) != 32)) THEN
		SET response = 'Invalid fromIP size.';
		LEAVE proc;
	END IF;

	IF (fromIP REGEXP '[^0-9a-fA-F]') THEN
		SET response = 'Invalid characters found in fromIP string.';
		LEAVE proc;
	END IF;

	IF (votes REGEXP '[^0-9a-zA-Z_]') THEN
		SET response = 'Invalid characters found in vote string.';
		LEAVE proc;
	END IF;

	SELECT p_id,p_subonly
	  INTO poll,p_sub
	  FROM polls
	 WHERE p_id =
		(SELECT CAST(value AS UNSIGNED INTEGER)
		   FROM config
		  WHERE option = "poll_active");
	IF (poll IS NULL) THEN
		SET response = 'No active poll found.';
		LEAVE proc;
	END IF;

	SET user = user_find(oauth);
	IF (user IS NULL) THEN
		SET response = 'User not found via OAuth.';
		LEAVE proc;
	END IF;

	SELECT u_sub
	  INTO u_sub
	  FROM users
	 WHERE u_id = user;
	IF ((p_sub IS NOT NULL)
	AND (u_sub IS NULL)) THEN
		SET response = 'Poll is sub-only, user is not a sub.';
		LEAVE PROC;
	END IF;

	SELECT COUNT(*)
	  INTO vote
	  FROM votes
	 WHERE _p_id = poll
	   AND _u_id = user;
	IF (vote != 0) THEN
		SET response = 'User already voted.';
		LEAVE proc;
	END IF;

	WHILE (CHAR_LENGTH(votes) > 0) DO
		SET vote = NULL;
		SELECT c_bit
		  INTO vote
		  FROM choices
		 WHERE _p_id = poll
		   AND _p_i_id = CONV(SUBSTRING_INDEX(votes, '_', 1), 36, 10);
		IF (vote IS NULL) THEN
			SET response = 'Invalid vote choice in vote string.';
			LEAVE proc;
		END IF;

		SET votes = SUBSTRING_INDEX(votes, '_', LENGTH(REPLACE(votes, '_', '')) - LENGTH(votes));
		SET choices = choices | (1 << vote);
	END WHILE;

	SET IPv6 = IF(LENGTH(fromIP) = 32, CAST(CONV(SUBSTRING(fromIP FROM 1 FOR 16), 16, 10) AS UNSIGNED INTEGER), NULL);
	SET IPv4 = CAST(CONV(SUBSTRING(CONCAT('ffffffff', fromIP) FROM -16), 16, 10) AS UNSIGNED INTEGER);

	SET response = 'Casting vote.';
	INSERT INTO votes
	   SET _p_id = poll
	     , _u_id = user
	     , IPv6 = IPv6
	     , IPv4 = IPv4
	     , v_choice_0 = IF((choices >>  0) & 1, "", NULL)
	     , v_choice_1 = IF((choices >>  1) & 1, "", NULL)
	     , v_choice_2 = IF((choices >>  2) & 1, "", NULL)
	     , v_choice_3 = IF((choices >>  3) & 1, "", NULL)
	     , v_choice_4 = IF((choices >>  4) & 1, "", NULL)
	     , v_choice_5 = IF((choices >>  5) & 1, "", NULL)
	     , v_choice_6 = IF((choices >>  6) & 1, "", NULL)
	     , v_choice_7 = IF((choices >>  7) & 1, "", NULL)
	     , v_choice_8 = IF((choices >>  8) & 1, "", NULL)
	     , v_choice_9 = IF((choices >>  9) & 1, "", NULL)
	     , v_choice_a = IF((choices >> 10) & 1, "", NULL)
	     , v_choice_b = IF((choices >> 11) & 1, "", NULL)
	     , v_choice_c = IF((choices >> 12) & 1, "", NULL)
	     , v_choice_d = IF((choices >> 13) & 1, "", NULL)
	     , v_choice_e = IF((choices >> 14) & 1, "", NULL)
	     , v_choice_f = IF((choices >> 15) & 1, "", NULL)
	     , v_choice_g = IF((choices >> 16) & 1, "", NULL)
	     , v_choice_h = IF((choices >> 17) & 1, "", NULL)
	     , v_choice_i = IF((choices >> 18) & 1, "", NULL)
	     , v_choice_j = IF((choices >> 19) & 1, "", NULL)
	     , v_choice_k = IF((choices >> 20) & 1, "", NULL)
	     , v_choice_l = IF((choices >> 21) & 1, "", NULL)
	     , v_choice_m = IF((choices >> 22) & 1, "", NULL)
	     , v_choice_n = IF((choices >> 23) & 1, "", NULL)
	     , v_choice_o = IF((choices >> 24) & 1, "", NULL)
	     , v_choice_p = IF((choices >> 25) & 1, "", NULL)
	     , v_choice_q = IF((choices >> 26) & 1, "", NULL)
	     , v_choice_r = IF((choices >> 27) & 1, "", NULL)
	     , v_choice_s = IF((choices >> 28) & 1, "", NULL)
	     , v_choice_t = IF((choices >> 29) & 1, "", NULL)
	     , v_choice_u = IF((choices >> 30) & 1, "", NULL)
	     , v_choice_v = IF((choices >> 31) & 1, "", NULL)
	     , v_choice_w = IF((choices >> 32) & 1, "", NULL)
	     , v_choice_x = IF((choices >> 33) & 1, "", NULL)
	     , v_choice_y = IF((choices >> 34) & 1, "", NULL)
	     , v_choice_z = IF((choices >> 35) & 1, "", NULL);
	SET response = 'Vote cast.';
END;
~
DELIMITER ;
