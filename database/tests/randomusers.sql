CALL user_update(
	SUBSTRING(CONV((RAND() + 1) * POW(36, 9), 10, 36) FROM 2)
,	SUBSTRING(CONV((RAND() + 1) * POW(36, 9), 10, 36) FROM 2)
,	IF(RAND() < 0.05,'',NULL)
,	IF(RAND() < 0.001,'',NULL)
);
SELECT COUNT(*) FROM users;
