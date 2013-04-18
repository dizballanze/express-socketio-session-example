
/**
 * Module dependencies.
 */

var DB = {
  'ip': '127.0.0.1',
  'port': 27017,
  'db': 'test'
}

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , socketio = require('socket.io')
  , MongoSessionStore = require('express-session-mongo')
  , cookie = require('cookie')
  , session_storage = new MongoSessionStore(DB);

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');


  app.use(express.cookieParser('KHjLxmkFB3VyKkPSmaLnUB75vA4aZDAF'));
  app.use(express.session({
    store: session_storage,
    secret: 'KHjLxmkFB3VyKkPSmaLnUB75vA4aZDAF',
    key: 'sid'
  }));

  app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
  });

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.all('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = socketio.listen(server);

io.configure(function() {
  io.set('authorization', function (data, accept) {
    if (!data.headers.cookie) 
      return accept('No cookie transmitted.', false);

    data.cookie = cookie.parse(data.headers.cookie);
    
    var sid = data.cookie['sid'];
    
    if (!sid) {
      accept(null, false);
    }

    sid = sid.substr(2).split('.');
    sid = sid[0];
    data.sessionID = sid;

    data.getSession = function(cb) {
      session_storage.get(sid, function(err, session) {
        if (err || !session) {
          console.log(err);
          accept(err, false);
          return;
        }
        cb(err, session);
      });
    }
    accept(null, true);
  });
});

io.sockets.on('connection', function(socket) {
  socket.join('chat');

  socket.on('message', function(data) {
    socket.handshake.getSession(function(err, session) {
      data['user'] = session.name || 'guest';
      io.sockets.in('chat').emit('message', data);
    });
  });
});