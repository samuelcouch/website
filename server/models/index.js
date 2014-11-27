var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var util      = require('../util'),
    log       = require('../log');
var match     = util.env.dbConnString.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/),
    name      = match[5],
    user      = match[1],
    pass      = match[2],
    port      = match[4],
    host      = match[3],
    sequelize = new Sequelize(name, user, pass, {
      dialect:    'postgres',
      protocol:   'postgres',
      port:       port,
      host:       host,
      logging:    log.details
    });
var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;