var 
fs = require('fs')
,crypto = require('crypto')
,tls = require('tls')
, express = require('express')
, os = require('os')
, DbProcess = require('./controller/dbProcess.js')
, routes = require('./routes')
, path = require('path');

,certPem = fs.readFileSync('apnagent-dev-key.pem', encoding='ascii')
,keyPem = fs.readFileSync('apnagent-dev-cert-noenc.pem', encoding='ascii')
,caCert = fs.readFileSync('aps_development.cer', encoding='ascii')
,options = { key: keyPem, cert: certPem, ca: [ caCert ] }
;

var port = process.env.PORT || 1337;
var app = express();

//Uses
app.use(express.errorHandler({
	dumpExceptions: true,
	showStack: true
}));
app.use(express.methodOverride());
app.use(express.bodyParser());


app.get('/register', function(req, res, next) {
	res.setHeader('200');
	var dbProcess = new DbProcess();
	dbProcess.registerToken(req.query['deviceToken'], function(updated) {
		if(updated)
			res.end('100'); 
		else
			res.end('101');   
	});
});

app.get('/post'), function(req, res, next) {
	res.setHeader('200');
	if(connectAPN(req.query['deviceToken'], function(){}))
		res.end('Sent')
	
}

function connectAPN(deviceToken, next ) {

	var stream = tls.connect(2195, 'gateway.sandbox.push.apple.com', options, function() {

        // connected
        next( !stream.authorized, stream );

    });

	var
        pushnd = { aps: { alert:'This is a test' }, customParam: { foo: 'bar' } } // 'aps' is required
        ,hextoken = deviceToken // Push token from iPhone app. 32 bytes as hexadecimal string
        ,token = hextobin(hextoken)
        ,payload = JSON.stringify(pushnd)
        ,payloadlen = Buffer.byteLength(payload, 'utf-8')
        ,tokenlen = 32
        ,buffer = new Buffer(1 +  4 + 4 + 2 + tokenlen + 2 + payloadlen)
        ,i = 0
        ,msgid = 0xbeefcace // message identifier, can be left 0
        ,seconds = Math.round(new Date().getTime() / 1000) + 1*60*60 // expiry in epoch seconds (1 hour)
        ,payload = JSON.stringify(pushnd);
        ;

    buffer[i++] = 1; // command
    buffer[i++] = msgid >> 24 & 0xFF;
    buffer[i++] = msgid >> 16 & 0xFF;
    buffer[i++] = msgid >> 8 & 0xFF;
    buffer[i++] = msgid & 0xFF;

    // expiry in epoch seconds (1 hour)
    buffer[i++] = seconds >> 24 & 0xFF;
    buffer[i++] = seconds >> 16 & 0xFF;
    buffer[i++] = seconds >> 8 & 0xFF;
    buffer[i++] = seconds & 0xFF;

    buffer[i++] = tokenlen >> 8 & 0xFF; // token length
    buffer[i++] = tokenlen & 0xFF;
    token = hextobin(hextoken);
    token.copy(buffer, i, 0, tokenlen)
    i += tokenlen;
    buffer[i++] = payloadlen >> 8 & 0xFF; // payload length
    buffer[i++] = payloadlen & 0xFF;

    payload = Buffer(payload);
    payload.copy(buffer, i, 0, payloadlen);
    stream.write(buffer);  // write push notification

    stream.on('data', function(data) {

    	var
            command = data[0] & 0x0FF  // always 8
            ,status = data[1] & 0x0FF  // error code
            ,msgid = (data[2] << 24) + (data[3] << 16) + (data[4] << 8 ) + (data[5])
            ;

            console.log(command + ':' + status + ':' + msgid);

        });

};

function hextobin(hexstr)
{
	buf = new Buffer(hexstr.length / 2);

	for(var i = 0; i < hexstr.length/2 ; i++)
	{
		buf[i] = (parseInt(hexstr[i * 2], 16) << 4) + (parseInt(hexstr[i * 2 + 1], 16));
	}

	return buf;
}