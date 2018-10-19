var express = require('express');
var router = express.Router();
var models = require("../models");
const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'admin'));
const session = driver.session();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const { Op } = models.sequelize;
  models.Researcher.findAll({    
    include: [{
      model: models.Researcher,
      include:[{model:models.Campus, as: 'campus',}],
      as:'related',
      through: {
        attributes: ['bc', 'cs'],        
        where: {
          [Op.or]: [
            {
              bc: {
                [Op.gt]: 0.000000
              }
            },
            {
              cs: {
                [Op.gt]: 0.000000
              }
            }
          ]
        },
      }
    },{
      model: models.Campus,
      as: 'campus',
      attributes: ['campus']
    }],
    limit: 50
    /*order: [[models.sequelize.literal('`related.RelatedResearcher.bc`'), 'DESC']],    */
  })
  .then((researchers) => res.json(researchers))
  .catch((err) => {
    console.log(err);
    return res.json(err)
  })
});

router.get('/single/:researcher_id', function (req, res) {
  res.send(req.params)
})

router.get('/relations', function(req, res, next) {
  models.sequelize.query('select a_campus.campus as a_campus , b_campus.campus as b_campus, a.name as a_name,b.name as b_name, RelatedResearchers.bc, RelatedResearchers.cs from RelatedResearchers inner join Researchers as a on RelatedResearchers.researcher = a.id inner join Campuses as a_campus on a_campus.id = a.campus_id inner join Researchers as b on b.id = RelatedResearchers.related inner join Campuses as b_campus on b_campus.id = b.campus_id where bc > 0.000000000 or cs > 0.00000000;', { type: models.sequelize.QueryTypes.SELECT})
  .then(relations => {
    res.json(relations);
  })	
});
router.get('/nodes', function(req, res, next) {
  models.sequelize.query('select r.id, r.name from Researchers as r limit 50;', { type: models.sequelize.QueryTypes.SELECT})
  .then(nodes => {
    res.json(nodes);
  })
});
router.get('/edges', function(req, res, next) {
  models.sequelize.query('select r.researcher, r.related, cs, bc from RelatedResearchers as r where bc > 0.00000 or cs > 0.00000', { type: models.sequelize.QueryTypes.SELECT})
  .then(edges => {
    res.json(edges);
  })
});
router.get('/researchersMenu', function (req, res, next) {  
  models.sequelize.query('select id, name from Researchers', { type: models.sequelize.QueryTypes.SELECT})
  .then(researchers => {
    res.json(researchers);
  })
});
router.get('/profile/:id', function (req, res, next) {
  models.Researcher.findById(req.params.id, {
    include: [
      {
        model: models.Campus,
        as: 'campus',
        attributes: ['campus']
      },
      {
        model: models.Project,
        as: 'projects',
        include: [
          {
            model: models.Keyword,
            as : 'keywords'
          },
          {
            model: models.Reference,
            as : 'references'
          }
        ]
      }
    ]
  })
  .then(profile => {
    res.json(profile)
  })
});
router.get('/keywordsgraph', function(req, res, next) {
  const resultPromise = session.run(
    'MATCH p=()-[r:KEYWORD_RECOMMENDED_TO]->() RETURN p LIMIT 50'    
  );

  return resultPromise.then(result => {
    session.close();
    driver.close();
    return res.send(result.records);
  });
});
module.exports = router;
