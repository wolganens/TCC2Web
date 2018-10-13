'use strict';
module.exports = (sequelize, DataTypes) => {
  const Campus = sequelize.define('Campus', {
    campus: DataTypes.STRING,
  }, {});
  Campus.associate = function(models) {
    // associations can be defined here
  };
  return Campus;
};