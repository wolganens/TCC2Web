'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('keyword_projects', {
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
      keyword_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    })
    .then(() => queryInterface.addConstraint('keyword_projects', ['project_id'], {
      type: 'foreign key',
      name: 'keyword_project_project_fkey',
      references: { //Required field
        table: 'Projects',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }))
    .then(() => queryInterface.addConstraint('keyword_projects', ['keyword_id'], {
      type: 'foreign key',
      name: 'keyword_project_keyword_fkey',
      references: { //Required field
        table: 'Keywords',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }))
    /*.then(() => {
      queryInterface.addConstraint('keyword_projects', ['project_id', 'keyword_id'], {
        type: 'primary key',
        name: 'keyword_projects_pkey'
      })
    })*/;
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('keyword_projects');
  }
};