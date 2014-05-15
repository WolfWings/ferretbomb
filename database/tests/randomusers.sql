SET @o = (SELECT SUBSTRING(CONV((1+RAND())*POW(36,9),10,36) FROM 2));
SET @u = (SELECT SUBSTRING(CONV((1+RAND())*POW(36,9),10,36) FROM 2));
INSERT INTO users (__H_oauth,__H_name,u_oauth,u_name,u_sub,u_turbo) VALUES
(UNHEX(SHA2(@o,256)),UNHEX(SHA2(@u,256)),@o,@u,IF(RAND()<0.05,'',NULL),IF(RAND()<0.001,'',NULL));
SELECT COUNT(*) FROM users;
