var express         = require('express'),
    passport        = require('passport'),
    path            = require('path'),
    flash           = require('connect-flash'),
    errorHandler    = require('errorhandler'),
    favicon         = require('serve-favicon');

var app             = express();
    server          = require('http').createServer(app),
    io              = require('socket.io').listen(server);

var config          = require('./routes/config');

var port            = config.domain.port;

var morgan          = require('morgan')
  , cookieParser    = require('cookie-parser')
  , bodyParser      = require('body-parser')
  , session         = require('express-session');

var query, db;


app.set('port', process.env.PORT || port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.use(session({secret: 'monkey'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

app.get('/postit/config', function(req, res) {
    res.send(config.public);
});

require('./routes/common/index.js')(app, config, passport);

if(config.ddbb) {
  db = require('./routes/mongodb/schemas');
  query = require('./routes/mongodb/functions')(app, db);
  require('./routes/api/articles')(app, config, db, query);
  require('./routes/api/users')(app, config, db, query);
  require('./routes/common/auth')(app, config, db, passport);
}

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);