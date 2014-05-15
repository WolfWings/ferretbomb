GRANT USAGE ON *.* TO ferretbomb@localhost;
GRANT SELECT ON `ferretbomb`.* TO ferretbomb@localhost;
GRANT INSERT ON `ferretbomb`.`votes` TO ferretbomb@localhost;
GRANT INSERT, UPDATE (u_follows, u_sub, u_oauth, __H_oauth) ON `ferretbomb`.`users` TO ferretbomb@localhost
