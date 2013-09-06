/**
 * User: rupin_t
 * Date: 9/5/13
 * Time: 5:04 PM
 */

var Crawlable = require('crawlable'),
    _ = require('lodash');

Crawlable.express({
    port: process.env.PORT || 5000,
    crawlable: {
        cacheOptions: {
            inMemoryOnly: true
        },
        cacheTtl: 3 * 60
    },
    handlebars: {
        args: [_, true],
        helpers: require('./public/src/helpers.js').register,
        views: 'views'
    },
    configure: function (app, express) {
        app.use(express.favicon());

        app.use(express.static(__dirname + '/public'));
        app.use(express.cookieParser());
        app.use(express.session({ secret: 'fwe5few64fwe54f6ewfewf156f5c4wef' }));

        app.use(express.bodyParser());
        app.use(express.methodOverride());

        app.use(express.logger('dev'));
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    },
    routes: function (app) {
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

            _.extend(req.session.user, req.body);

            if (req.query.redirect)
                return res.redirect(req.query.redirect);

            res.send(req.session.user);
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

            if (req.query.redirect)
                return res.redirect(req.query.redirect);

            res.send(req.body);
        });

        app.delete('/api/todos/:id', function (req, res) {
            req.session.todos = req.session.todos || {};

            var todo = req.session.todos[req.params.id];

            if (!todo)
                return res.send(404);

            req.session.todos = _.omit(req.session.todos, todo.id);

            if (req.query.redirect)
                return res.redirect(req.query.redirect);

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

            _.extend(todo, req.body);

            if (req.query.redirect)
                return res.redirect(req.query.redirect);

            res.send(todo);
        });

        app.crawlable('/');
    },
    render: function (req, res) {
        res.render('app.html', {
            staticApp: req.crawlable ? req.crawlable.html : '',
            noJs: !!req.query.noJs
        });
    }
}, function (err, app) {
    if (err)
        return console.log(err);
    console.log('The application is ready.');
    app.crawl();
});