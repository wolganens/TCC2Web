'use strict';
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    sippee_id: DataTypes.INTEGER,
    researcher_id: DataTypes.INTEGER,
  }, {});
  Project.associate = function(models) {
    models.Project.belongsToMany(models.Keyword, {
      through: models.keyword_project,
      as:'keywords',
      foreignKey: 'project_id',
      otherKey: 'keyword_id',
    });
    models.Project.hasMany(models.Reference, {
      as: 'references',
      foreignKey: 'project_id'
    });
  };
  return Project;
};