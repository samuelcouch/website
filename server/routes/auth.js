var fs          = require('fs'),
    path        = require('path'),
    async       = require('async'),
    passport    = require('passport');

var log         = require('../log');
var models      = require('../models');

exports.route = function(app) {
    app.get('/api/auth/me', function(req, res) {
        if (!req.user) {
            res.status(200).send({});
        } else {
            res.status(200).json({
                id:         req.user.id,
                userName:   req.user.userName,
                firstName:  req.user.firstName,
                lastName:   req.user.lastName
            });
        }
    });

    app.post('/api/auth/login', passport.authenticate('local-login'), function(req, res) {
        // Authentication succeeded
        return res.status(200).json({
            id:         req.user.id,
            userName:   req.user.userName,
            firstName:  req.user.firstName,
            lastName:   req.user.lastName
        });
    });

    app.post('/api/auth/register', function(req, res) {
        models
        .User
        .findOrCreate({
            where: {
                templeEmailAddress: req.body.temail
            }
        },
        {
            password: req.body.password
        })
        .success(function(user, created){
            if(!created)
                return res.status(409);
            return res.status(200);
        });
    });
};