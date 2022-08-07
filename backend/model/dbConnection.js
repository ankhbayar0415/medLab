var mysql = require("mysql");

var mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "medialab",
  multipleStatements: true,
});

mysqlConnection.connect(function (err) {
  if (!err) {
    console.log("Database connected");
  } else {
    console.log("Database connection failed");
  }
});

module.exports = mysqlConnection;
