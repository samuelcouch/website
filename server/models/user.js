module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    userName:               DataTypes.STRING,
    password:               DataTypes.STRING,
    firstName:              DataTypes.STRING,
    lastName:               DataTypes.STRING,
    templeEmailAddress:     {
        type:       DataTypes.STRING,
        validate:   {
            isEmail: true
        }
    },
    personalEmailAddress:   {
        type:       DataTypes.STRING,
        validate:   {
            isEmail: true
        }
    },
    twitter:                DataTypes.STRING,
    github:                 DataTypes.STRING,
    bio:                    DataTypes.TEXT
  });

  return User;
}