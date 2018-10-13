'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('References', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reference: {
        type: Sequelize.TEXT,
        allowNull: false,
      }
    })
    .then( () => queryInterface.createTable('reference_projects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    })
    .then(() => queryInterface.addConstraint('reference_projects', ['project_id'], {
      type: 'foreign key',
      name: 'reference_project_project_fkey',
      references: { //Required field
        table: 'Projects',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }))
    .then(() => queryInterface.addConstraint('reference_projects', ['reference_id'], {
      type: 'foreign key',
      name: 'reference_project_reference_fkey',
      references: { //Required field
        table: 'References',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('References');
  }
};