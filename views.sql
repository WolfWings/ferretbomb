CREATE OR REPLACE VIEW readable_votes AS
	SELECT
		v_id,
		_p_id,
		_u_id,
		CONCAT(
			IF(v_choice_0 IS NOT NULL,"Y","n"),
			IF(v_choice_1 IS NOT NULL,"Y","n"),
			IF(v_choice_2 IS NOT NULL,"Y","n"),
			IF(v_choice_3 IS NOT NULL,"Y","n"),
			IF(v_choice_4 IS NOT NULL,"Y","n"),
			IF(v_choice_5 IS NOT NULL,"Y","n"),
			IF(v_choice_6 IS NOT NULL,"Y","n"),
			IF(v_choice_7 IS NOT NULL,"Y","n"),
			IF(v_choice_8 IS NOT NULL,"Y","n"),
			IF(v_choice_9 IS NOT NULL,"Y","n"),
			IF(v_choice_a IS NOT NULL,"Y","n"),
			IF(v_choice_b IS NOT NULL,"Y","n"),
			IF(v_choice_c IS NOT NULL,"Y","n"),
			IF(v_choice_d IS NOT NULL,"Y","n"),
			IF(v_choice_e IS NOT NULL,"Y","n"),
			IF(v_choice_f IS NOT NULL,"Y","n"),
			IF(v_choice_g IS NOT NULL,"Y","n"),
			IF(v_choice_h IS NOT NULL,"Y","n"),
			IF(v_choice_i IS NOT NULL,"Y","n"),
			IF(v_choice_j IS NOT NULL,"Y","n"),
			IF(v_choice_k IS NOT NULL,"Y","n"),
			IF(v_choice_l IS NOT NULL,"Y","n"),
			IF(v_choice_m IS NOT NULL,"Y","n"),
			IF(v_choice_n IS NOT NULL,"Y","n"),
			IF(v_choice_o IS NOT NULL,"Y","n"),
			IF(v_choice_p IS NOT NULL,"Y","n"),
			IF(v_choice_q IS NOT NULL,"Y","n"),
			IF(v_choice_r IS NOT NULL,"Y","n"),
			IF(v_choice_t IS NOT NULL,"Y","n"),
			IF(v_choice_s IS NOT NULL,"Y","n"),
			IF(v_choice_u IS NOT NULL,"Y","n"),
			IF(v_choice_v IS NOT NULL,"Y","n"),
			IF(v_choice_w IS NOT NULL,"Y","n"),
			IF(v_choice_x IS NOT NULL,"Y","n"),
			IF(v_choice_y IS NOT NULL,"Y","n"),
			IF(v_choice_z IS NOT NULL,"Y","n")
		) AS v_choices,
		v_when,
		IPv6,
		IPv4
	FROM votes;

CREATE OR REPLACE VIEW readable_users AS
	SELECT
		u_id,
		HEX(__H_oauth) AS __H_oauth,
		HEX(__H_name) AS __H_name,
		IF(u_sub IS NOT NULL,"Y","n") AS u_sub,
		IF(u_follows IS NOT NULL,"Y","n") AS u_follows,
		u_oauth,
		u_name,
		u_updated
	FROM users;
