'use strict';
module.exports = (sequelize, DataTypes) => {
  const keyword_project = sequelize.define('keyword_project', {
    project_id: DataTypes.INTEGER,
    keyword_id: DataTypes.INTEGER,
  }, {});
  keyword_project.associate = function(models) {
    // associations can be defined here
  };
  return keyword_project;
};