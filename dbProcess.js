var options = {
	host     : '174.132.104.162',
	user     : 'berk_LocusAdmin',
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
	
	this.client = client;

	

} 
DbProcess.prototype.registerToken = function(token, cb) {
	var dbProcess = new DbProcess();
	var statement = 'INSERT INTO tokentable SET token = ' + dbProcess.connection.escape(token) + 'ON DUPLICATE KEY UPDATE token = ' + dbProcess.connection.escape(token);
	dbProcess.connection.query(statement, function(err, result) {
		if(err) {
			cb(false);
			return throw err;
			dbProcess.connection.end();
		}
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
			return throw err;
			dbProcess.connection.end();
		}
		dbProcess.connection.end();
		cb(true);
	});


}	



module.exports = exports = DbProcess;
