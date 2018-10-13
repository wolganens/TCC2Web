'use strict';
module.exports = (sequelize, DataTypes) => {
  const Keyword = sequelize.define('Keyword', {
    keyword: DataTypes.STRING,
  }, {});
  Keyword.associate = function(models) {
    // associations can be defined here
  };
  return Keyword;
};