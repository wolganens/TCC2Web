'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Projects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sippee_id: {
        type: Sequelize.INTEGER
      },
      researcher_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    })
    .then(() => queryInterface.addConstraint('Projects', ['researcher_id'], {
      type: 'foreign key',
      name: 'ProjectResearcher_fk_constraint',
      references: { //Required field
        table: 'Researchers',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Projects');
  }
};