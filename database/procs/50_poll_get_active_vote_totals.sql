DROP PROCEDURE IF EXISTS poll_get_active_vote_totals;
DELIMITER ~
CREATE PROCEDURE poll_get_active_vote_totals (
)
	NOT DETERMINISTIC
	READS SQL DATA
BEGIN
	SELECT COUNT(v_choice_0) AS `0`
	     , COUNT(v_choice_1) AS `1`
	     , COUNT(v_choice_2) AS `2`
	     , COUNT(v_choice_3) AS `3`
	     , COUNT(v_choice_4) AS `4`
	     , COUNT(v_choice_5) AS `5`
	     , COUNT(v_choice_6) AS `6`
	     , COUNT(v_choice_7) AS `7`
	     , COUNT(v_choice_8) AS `8`
	     , COUNT(v_choice_9) AS `9`
	     , COUNT(v_choice_a) AS `a`
	     , COUNT(v_choice_b) AS `b`
	     , COUNT(v_choice_c) AS `c`
	     , COUNT(v_choice_d) AS `d`
	     , COUNT(v_choice_e) AS `e`
	     , COUNT(v_choice_f) AS `f`
	     , COUNT(v_choice_g) AS `g`
	     , COUNT(v_choice_h) AS `h`
	     , COUNT(v_choice_i) AS `i`
	     , COUNT(v_choice_j) AS `j`
	     , COUNT(v_choice_k) AS `k`
	     , COUNT(v_choice_l) AS `l`
	     , COUNT(v_choice_m) AS `m`
	     , COUNT(v_choice_n) AS `n`
	     , COUNT(v_choice_o) AS `o`
	     , COUNT(v_choice_p) AS `p`
	     , COUNT(v_choice_q) AS `q`
	     , COUNT(v_choice_r) AS `r`
	     , COUNT(v_choice_s) AS `s`
	     , COUNT(v_choice_t) AS `t`
	     , COUNT(v_choice_u) AS `u`
	     , COUNT(v_choice_v) AS `v`
	     , COUNT(v_choice_w) AS `w`
	     , COUNT(v_choice_x) AS `x`
	     , COUNT(v_choice_y) AS `y`
	     , COUNT(v_choice_z) AS `z`
	  FROM votes
	       INNER JOIN users
	               ON votes._u_id = users.u_id
	       INNER JOIN polls
	               ON votes._p_id = polls.p_id
	 WHERE (    u_sub IS NOT NULL
             OR ISNULL(u_sub) = ISNULL(p_subonly)
	       )
	   AND _p_id =
		(SELECT CAST(value AS UNSIGNED INTEGER)
		   FROM config
		  WHERE option = "poll_active");
END;
~
DELIMITER ;
