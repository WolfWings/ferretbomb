INSERT IGNORE INTO votes (_p_id,_u_id,v_choice_0,v_choice_1,v_choice_2,v_choice_3,IPv4) SELECT
(SELECT MAX(p_id) FROM polls),u_id,IF(RAND()<0.5,'',NULL),IF(RAND()<0.5,'',NULL),IF(RAND()<0.5,'',NULL),IF(RAND()<0.5,'',NULL),0
FROM users;
