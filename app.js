var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
//var logger = require('./routes/logger');

var routes = require('./routes/index');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));

/*
//log setting
app.use(require('morgan')({ "stream": logger.stream }));


var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: __dirname + '/logs/dayLog/d.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            colorize: true
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};


app.use(require("morgan")("combined",
    { "stream": logger.stream }));
    */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'coding-project',
    resave: false,
    saveUninitialized: true
}));

app.use('/', routes);

app.get('/img/:string',function(req,res){
    var recvData = req.params;
    var split = recvData.string;

    if(split.search('..')!=-1){
        res.send('<p>wrong approach</p>');
        return;
    }
    else{
        var file = __dirname+'/public/img/'+split;
        var filestream = fs.createReadStream(file);

        filestream.on('open',function(){
            filestream.pipe(res);
        });
        filestream.on('error',function(err){
            if(err){
                res.json({result:'f'});
            }
        });
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
