'use strict';
module.exports = (sequelize, DataTypes) => {
  const RelatedResearcher = sequelize.define('RelatedResearcher', {
    researcher: DataTypes.INTEGER,
    related: DataTypes.INTEGER,
    com_ref_count: DataTypes.INTEGER,
    com_key_count: DataTypes.INTEGER,
    bc: DataTypes.FLOAT,
    cs: DataTypes.FLOAT,
    coauthor: DataTypes.BOOLEAN,
  }, {});
  RelatedResearcher.associate = function(models) {
    models.RelatedResearcher.belongsTo(models.Researcher, {
      foreignKey: 'researcher',
      as: 'r_researcher'
    });
    models.RelatedResearcher.belongsTo(models.Researcher, {
      foreignKey: 'related',
      as: 'r_related'
    });
  };
  return RelatedResearcher;
};