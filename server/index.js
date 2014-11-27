var express         = require('express'),
    // General purpose imports
    path            = require('path'),
    async           = require('async'),
    crypto          = require('crypto'),
    // Express specific imports
    favicon         = require('serve-favicon'),
    session         = require('express-session'),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    passport        = require('passport'),
    local           = require('passport-local');

var routes      = require('./routes'),
    db          = require('./models'),
    util        = require('./util'),
    log         = require('./log');

module.exports = function(done) {
    // Create the server instance
    var app = express();
    // Middleware
    // Serves the website favicon
    app.use(favicon(path.join(__dirname, '..', 'client', 'img', 'favicon.ico')));
    // Serves our static assets
    app.use('/static', express.static(path.join(__dirname, '..', 'client', 'dist')));
    // Parses cookies
    app.use(cookieParser());
    // Reads JSON request bodies
    app.use(bodyParser.json());
    // Reads formdata request bodies
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    // Enables cookie-based browser sessions
    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: util.env.sessionSecret
    }));
    // Perform setup
    async.series([
        function(callback) {
            db
            .sequelize
            .sync({
                force: util.env.isResettingDb
            })
            .success(function(){
                log.info('Database configuration completed');
                callback();
            })
            .catch(function(err) {
                callback(err);
            });
        },
        function(callback) {
            // Setup the passport configuration
            app.use(passport.initialize());
            app.use(passport.session());
            // Setup the local passport strategy
            passport.use(new local.Strategy({
                usernameField: 'templeEmailAddress',
                passReqToCallback: true
            }, function(req, templeEmailAddress, password, done) {
                var User = req.models.User;
                User.find({
                    templeEmailAddress: templeEmailAddress
                }).then(function(user) {
                    if (!user) {
                        return done(null, false, {
                            message: 'Could not authenticate user "' + templeEmailAddress + '"'
                        });
                    } else {
                        // We found a user matching that user name
                        var hashedPassword = crypto.createHash('sha256').update(password, 'utf8').digest('base64');
                        // Compare hashed password here and in the database
                        if (user.password !== hashedPassword) {
                            return done(null, false, {
                                message: 'Could not authenticate user "' + templeEmailAddress + '"'
                            });
                        } else {
                            return done(null, user);
                        }
                    }
                }).catch(function(err) {
                    return done(null, false, err);
                });
            }));
            // Teach passport how to think about users in the database
            passport.serializeUser(function(user, done) {
                done(null, user.id);
            });
            passport.deserializeUser(function(req, id, done) {
                var User = req.models.User;
                User.find(id).success(function(user) {
                    done(undefined, user);
                }).error(function(err) {
                    done(err);
                });
            });
            // Passport is now ready to plow
            log.debug('Passport configuration complete');
            callback();
        },
        function(callback) {
            // Perform server routing
            routes.route(app, callback);
        },
        function(callback) {
            // Start servicing the requests
            app.listen(util.env.serverPort, callback);
        }
    ], function(err) {
        if (err) {
            log.error('Server could not start', err);
            if (done) done(err);
        } else {
            log.info('Server is listening on ' + util.env.serverPort + '\n');
            if (done) done();
        }
    });
};