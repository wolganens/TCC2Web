'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Researchers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      campus_id: {
        type: Sequelize.INTEGER,        
        allowNull: false
      },
    })
    .then(() => queryInterface.addConstraint('Researchers', ['campus_id'], {
      type: 'foreign key',
      name: 'researcher_campus_fkey',
      references: { //Required field
        table: 'Campuses',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Researchers');
  }
};