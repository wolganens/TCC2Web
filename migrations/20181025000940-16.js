'use strict';
const models = require("../models");
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(); // Default is a 128-bit UID encoded in base58
module.exports = {
  up: (queryInterface, Sequelize) => {
    const generated = []
    queryInterface.sequelize.query("SELECT id, evaluationToken FROM `Researchers`", { type: queryInterface.sequelize.QueryTypes.SELECT})
    .then(researchers => {
      researchers.forEach(r => {
        let token = uidgen.generateSync();
        while (generated.indexOf(token) != -1) {
          token = uidgen.generateSync();
        }
        generated.push(token)
        if (!r.evaluationToken) {
          queryInterface.sequelize.query(`UPDATE Researchers SET evaluationToken = '${token}' WHERE id = ${r.id}`).spread((results, metadata) => {
            console.log(results)
            console.log(metadata)
          })
        }
      })
    })

  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
