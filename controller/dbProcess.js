var options = {
	host     : '174.132.104.170',
	user     : 'berk_notifAdmin',
	password : '2401101992CcC',
	insecureAuth: true,
	database: 'berk_rednotif'
} 

var DbProcess = function () {

	var md5 = require('MD5');
	var mysql = require('mysql');
	this.md5 = md5;
	this.mysql = mysql;
	this.connection = mysql.createConnection(options);
	
} 
DbProcess.prototype.registerToken = function(token, cb) {
	var dbProcess = new DbProcess();
	var statement = 'INSERT INTO tokentable SET token = ' + dbProcess.connection.escape(token) + ' ON DUPLICATE KEY UPDATE token = ' + dbProcess.connection.escape(token);
	dbProcess.connection.query(statement, function(err, result) {
		if(err) {
			console.log(result);
			dbProcess.connection.end();
			cb(false);
		}
		console.log(result);
		dbProcess.connection.end();
		cb(true);
	});


}	

DbProcess.prototype.deleteToken = function(token, cb) {
	var dbProcess = new DbProcess();
	var statement = 'DELETE FROM tokentable WHERE token = ' + dbProcess.connection.escape(token);
	dbProcess.connection.query(statement, function(err, result) {
		if(err) {
			cb(false);
			dbProcess.connection.end();
		}
		dbProcess.connection.end();
		cb(true);
	});


}	

DbProcess.prototype.getToken = function(cb) {
	var dbProcess = new DbProcess();
	var statement = 'SELECT * FROM tokentable';
	dbProcess.connection.query(statement, function(err, rows, fields) {
		if (err) throw err;
		var length = rows.length;
		var tokens = new Array;

		
		for (var i = 0; i < length; i++) {
			console.log('in get token');
			tokens.push(rows[i].token);
			if(i == length - 1) {
				console.log('burda');
				cb(tokens);
				dbProcess.connection.end();

			}
		}
		
		
	});


}	


module.exports = exports = DbProcess;
