'use strict';
module.exports = (sequelize, DataTypes) => {
  const reference_project = sequelize.define('reference_project', {
    project_id: DataTypes.INTEGER,
    reference_id: DataTypes.INTEGER,
  }, {});
  reference_project.associate = function(models) {
    // associations can be defined here
  };
  return reference_project;
};