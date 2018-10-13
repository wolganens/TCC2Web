'use strict';
module.exports = (sequelize, DataTypes) => {
  const Researcher = sequelize.define('Researcher', {
    name: DataTypes.STRING,
    campus_id: DataTypes.INTEGER,
  }, {});
  Researcher.associate = function(models) {
    models.Researcher.belongsToMany(models.Researcher, {
      through: models.RelatedResearcher,
      as:'related',
      foreignKey: 'researcher',
      otherKey: 'related',
    });
    models.Researcher.belongsTo(models.Campus, {
      as: 'campus',
      foreignKey: 'campus_id'
    });
    models.Researcher.hasMany(models.Project, {
      as: 'projects',
      foreignKey: 'researcher_id'
    });
  };
  return Researcher;
};