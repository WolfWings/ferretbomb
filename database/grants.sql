REVOKE ALL PRIVILEGES, GRANT OPTION FROM ferretbomb@localhost;
GRANT USAGE ON *.* TO ferretbomb@localhost;
GRANT EXECUTE ON ferretbomb.* TO ferretbomb@localhost;

REVOKE ALL PRIVILEGES, GRANT OPTION FROM ferretadmin@localhost;
GRANT USAGE ON *.* TO ferretadmin@localhost IDENTIFIED BY PASSWORD '*****************************************';
GRANT SELECT ON ferretbomb.* TO ferretadmin@localhost;
GRANT INSERT ON ferretbomb.votes TO ferretadmin@localhost;
GRANT INSERT, UPDATE ON ferretbomb.polls TO ferretadmin@localhost;
GRANT INSERT, UPDATE ON ferretbomb.poll_items TO ferretadmin@localhost;
GRANT INSERT, DELETE ON ferretbomb.choices TO ferretadmin@localhost;
GRANT INSERT, UPDATE, DELETE ON ferretbomb.config TO ferretadmin@localhost;
GRANT EXECUTE ON ferretbomb.* TO ferretadmin@localhost;
GRANT INSERT, UPDATE (u_follows, u_sub, u_oauth, __H_oauth) ON ferretbomb.users TO ferretadmin@localhost;
