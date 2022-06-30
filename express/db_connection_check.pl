use DBI;
$dsn = $ARGV[0];
$username = $ARGV[1];
$password = $ARGV[2];
$dbh = DBI->connect($dsn, $username, $password);

if ($dbh) {
    print('OK');
    $dbh->disconnect();
} else {
    print(DBI->errstr());
}