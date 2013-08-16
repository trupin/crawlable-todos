/**
 * User: rupin_t
 * Date: 8/14/13
 * Time: 11:31 AM
 */

var express = require('express'),
    _ = require('lodash'),
    url = require('url'),
    Crawlable = require('crawlable');

var helpers = require('./public/src/helpers.js');

helpers.register(Crawlable.Solidify.HandleBars, _);

var host = 'http://localhost:3000';

var crawlable = Crawlable.create({
    Renderer: Crawlable.renderers.Casper,
    Cache: Crawlable.caches.NeDb,
    cacheOptions: {
        inMemoryOnly: true
    },
    cacheTtl: 3 * 60,
    host: host
});

crawlable.start(function (err) {
    if (err) return console.log(err);

    var app = express();

    app.configure(function () {
        app.use(express.favicon());

        app.set('view engine', 'html');
        app.engine('html', require('hbs').__express);
        app.set('views', __dirname + '/views');

        app.use(express.static(__dirname + '/public'));

        app.use(express.cookieParser());
        app.use(express.session({ secret: 'fwe5few64fwe54f6ewfewf156f5c4wef' }));

        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(crawlable._solidify.express());

        app.use(express.logger('dev'));
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.get('/api/user', function (req, res) {
        req.session.user = req.session.user || {};
        req.session.user.id = _.uniqueId('user');
        req.session.user.name = req.session.user.name || 'Unknown User';
        res.send(req.session.user);
    });

    app.put('/api/user', function (req, res) {
        req.session.user = req.session.user || {};

        req.body = _.pick(req.body, 'name');
        if (!_.isString(req.body.name))
            return res.send(400);

        res.send(_.extend(req.session.user, req.body));
    });

    app.get('/api/todos', function (req, res) {
        req.session.todos = req.session.todos || {};
        res.send(_.toArray(req.session.todos));
    });

    app.get('/api/todos/:id', function (req, res) {
        req.session.todos = req.session.todos || {};

        var todo = req.session.todos[req.params.id];
        if (!todo)
            return res.send(404);

        res.send(todo);
    });

    app.post('/api/todos', function (req, res) {
        req.session.todos = req.session.todos || {};

        req.body = _.pick(req.body, 'task');

        if (!_.isString(req.body.task))
            return res.send(400);

        req.body.id = _.uniqueId('todo');
        req.body.creationDate = req.body.lastUpdateDate = new Date();
        req.body.done = false;
        req.session.todos[req.body.id] = req.body;

        res.send(req.body);
    });

    app.delete('/api/todos/:id', function (req, res) {
        req.session.todos = req.session.todos || {};

        var todo = req.session.todos[req.params.id];

        if (!todo)
            return res.send(404);

        req.session.todos = _.omit(req.session.todos, todo.id);
        res.send(todo);
    });

    app.put('/api/todos/:id', function (req, res) {
        req.session.todos = req.session.todos || {};

        var todo = req.session.todos[req.params.id];

        if (!todo)
            return res.send(404);

        req.body = _.pick(req.body, 'done');
        if (!_.isNumber(parseInt(req.body.done)))
            return res.send(400);
        req.body.done = !!parseInt(req.body.done);

        req.body.lastUpdate = new Date();

        res.send(_.extend(todo, req.body));
    });

    app.get('*', crawlable.express(), function (req, res) {
        res.render('app.html', { staticApp: req.crawlable ? req.crawlable.html : '' });
    });

    app.listen(url.parse(host).port);

    console.log('Server launched at "' + host + '"');
});