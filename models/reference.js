'use strict';
module.exports = (sequelize, DataTypes) => {
  const Reference = sequelize.define('Reference', {
    reference: DataTypes.TEXT,
  }, {});
  Reference.associate = function(models) {
    // associations can be defined here
  };
  return Reference;
};