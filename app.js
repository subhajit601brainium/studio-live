var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var mongoose = require('mongoose');
var http = require('http');

var config = require('./config');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

//============== Create Server Strats =================//
var server = http.createServer(app);

//============== Create Server Ends ===================//
app.use(logger('dev'));

//================= Add Middleware for REST starts ================//
app.use(express.json({extended: true, limit: '200000kb', parameterLimit: 200000 * 100}));
app.use(express.urlencoded({ extended: true, limit: '200000kb', parameterLimit: 200000 * 100 }));

//================= Add Middleware for REST starts ================//

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//=============== CORS Support starts ==================//
app.use(function(req, res, next) {
    req.setEncoding('utf8');
    /** Websites you want to allow to connect */
    res.setHeader('Access-Control-Allow-Origin', '*')

    /** Request Methods */
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    /** Request Headers */
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');

    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }

});

//=============== CORS Support ends ==================//
var apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);

//=============== Load The Routes Starts ==============//

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

//=============== Load The Routes Ends ==================//



//=================== Connect To MongoDB Starts ======================//
const producationString = "mongodb://" + config.production.username + ":" + config.production.password + "@" + config.production.host + ":" + config.production.port + "/" + config.production.dbName + "?authSource=" + config.production.authDb;

var options = {};

mongoose.connect(producationString, options, function(err) {
    if (err) {
        console.log(err + 'Connection Failed!');
    } else {
        console.log('Connected to Database');
    }
});

/** Mongo on connection Emit */
mongoose.connection.on('connect', function() {
    console.log('Mongo database connected');
});

/** Mongo on error emit */
mongoose.connection.on('error', function(err) {
    console.log('Mongo db error' + err);
});

/** Mongo on retry connection */
mongoose.connection.on('disconnected', function() {
    console.log('Mongo db disconnected and trying for reconnect');
    // mongoose.connectToDatabase();
    mongoose.createConnection();
});

//======================= Mongo Db connection ends ===================//

// module.exports = app;

app.set('port', config.port);
server.listen(app.get('port'), function(err) {
    if (err) {
        throw err;
    } else {
        console.log('Server is running and listening on http://localhost:' + app.get('port'));
    }
    
});

server.timeout = 5000000;
