INSERT INTO config (option, value) SELECT
	"admin_password_salt",
	SHA2(RAND(), 256) as newvalue;

INSERT INTO config (option, value) SELECT
	"admin_password_hash",
	SHA2(CONCAT(value, "password"), 256) as newvalue
FROM config WHERE
	option = "admin_password_salt";
