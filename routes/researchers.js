var express = require('express');
var router = express.Router();
var models = require("../models");

/* GET users listing. */
router.get('/', function(req, res, next) {
  const { Op } = models.sequelize;
  models.Researcher.findAll({
    where: {
      campus_id: 9
    },
    include: [
      {
        model: models.Project,
        as: 'projects',        
      },
      {
        model: models.Researcher,
        include:[
          {
            model:models.Campus, 
            as: 'campus',
          }
        ],
        as:'related',
        through: {
          attributes: ['bc', 'cs', 'com_ref_count'],        
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
      },
      {
        model: models.Campus,
        as: 'campus',
        attributes: ['campus']
      }
    ],
    /*order: [[models.sequelize.literal('`related.RelatedResearcher.bc`'), 'DESC']],    */
  })
  .then((researchers) => res.json(
    researchers
    .filter(r => r.related.length > 5)
    .sort((a,b) => {
      if (a.projects.length < b.projects.length) {
        return 1;
      }
      if (a.projects.length > b.projects.length) {
        return -1;
      }
      return 0;
    })
    .filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj['campus_id']).indexOf(obj['campus_id']) === pos;
    }).slice(0, 20)
  ))
  .catch((err) => {
    console.log(err);
    return res.json(err)
  })
});

router.get('/single/:researcher_id', function (req, res) {
  res.send(req.params)
})

router.get('/relations', function(req, res, next) {
  models.sequelize.query('select com_ref_count, a_campus.campus as a_campus , b_campus.campus as b_campus, a.name as a_name,b.name as b_name, RelatedResearchers.bc, RelatedResearchers.cs from RelatedResearchers inner join Researchers as a on RelatedResearchers.researcher = a.id inner join Campuses as a_campus on a_campus.id = a.campus_id inner join Researchers as b on b.id = RelatedResearchers.related inner join Campuses as b_campus on b_campus.id = b.campus_id where bc > 0.000000000 or cs > 0.00000000;', { type: models.sequelize.QueryTypes.SELECT})
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
module.exports = router;
