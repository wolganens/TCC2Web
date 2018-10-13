'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('RelatedResearchers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      researcher: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      related: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      bc: {
        type: Sequelize.FLOAT
      },
      cs: {
        type: Sequelize.FLOAT
      },
      com_ref_count: {
        type: Sequelize.TINYINT
      },
      com_key_count: {
        type: Sequelize.TINYINT
      },
      coauthor: {
        type: Sequelize.TINYINT
      }
    })
    .then(() => queryInterface.addConstraint('RelatedResearchers', ['researcher'], {
      type: 'foreign key',
      name: 'researcher_fkey',
      references: { //Required field
        table: 'Researchers',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }))
    .then(() => queryInterface.addConstraint('RelatedResearchers', ['related'], {
      type: 'foreign key',
      name: 'related_fkey',
      references: { //Required field
        table: 'Researchers',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }))
    /*.then(() => {
      queryInterface.addConstraint('RelatedResearchers', ['researcher', 'related'], {
        type: 'primary key',
        name: 'RelatedResearcher_pkey'
      })
    })*/;
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('RelatedResearchers');
  }
};