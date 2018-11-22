const express = require('express');
const router = express.Router();
const models = require("../models");
const http = require("http");
const querystring = require('querystring');
/*const neo4j = require('neo4j-driver').v1;*/
const request = require('request');
const { PythonShell } = require('python-shell');
const db = require("seraph")({
  /*server: "https://hobby-ghjpdibickbegbkefenfoebl.dbs.graphenedb.com:24780",
  user: "wolgan",
  pass: "b.8Ta7H6xRbwU1.VTysLTSwMFOSGVaO"*/
  server: "http://localhost:7474/",
  user: "neo4j",
  pass: "admin"
});
var neo4j = require('neo4j');
var db1 = new neo4j.GraphDatabase("http://neo4j:admin@localhost:7474");
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
router.get('/get_recommendation_evidences/:name', function (req, res, next) {
  return models.Researcher.findOne({
    where: {
      name: req.params.name
    },
    include: [
      {
        model: models.Campus,
        as: 'campus',
        attributes: ['campus']
      },
      {
        model: models.Project,
        as: 'projects',
      }
    ]
  })
  .then(results => {    
    return res.send(results);
  })
});
router.get('/profile_by_name/:name/:id', function (req, res, next) {
  models.Researcher.findOne({
    where: {
      name: req.params.name
    },
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
    const target_references = models.Researcher.findById(req.params.id, {      
      include: [
        {
          model: models.Project,
          as: 'projects',
          include: [
            {
              model: models.Reference,
              as : 'references',
              attributes: ['reference']
            }
          ]
        }
      ]
    }).then(p1 => {
      p1_references = []
      p1.projects.forEach(proj => {
        proj.references.forEach( ref => {
          p1_references.push(ref.reference);
        })
      });
      const p_references = [];
      profile.projects.forEach(p => {
        p.references.forEach( ref => {
          p_references.push(ref.reference)
        });
      });
      let options = {
        mode: 'text',
        pythonPath: '/usr/bin/python3',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: '/home/wolgan/TCC2/web/routes/',
        args: p1_references.concat(['$SEPARADOR$'], p_references)
      };
      PythonShell.run('common_references.py', options, function (err, results) {
        if (err) throw err;        
        res.json({profile, references: results})
      });
    });
  })
})
router.get('/profile/:name', function (req, res, next) {
  models.Researcher.findOne({
    where: {
      name: req.params.name
    },
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
    const options = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization' : Buffer.from('neo4j:admin').toString('base64')
      },
      json: true,
      body: {
        "statements":
        [
          {
            "statement": "MATCH (n:Researcher) where n.name = '" + profile.name + "' RETURN n.lattes limit 1"            
          }
        ]
      },
    };

    return request.post(
      'http://localhost:7474/db/data/transaction/commit',
      options,
      function(error, result){
        const lattes = result.body.results[0].data[0].row[0];
        return res.json(Object.assign(profile.toJSON(), {lattes}));
      }
    );
  })
});
router.get('/profile_by_token/:token', function (req, res, next) {
  console.log(req.params.token)
  models.Researcher.findOne({
    where: {
      evaluationToken: req.params.token
    },
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
  .then(profile=> {
    res.json(profile)
  })
  .then(profile => {
    res.json(profile)
  })
});
router.get('/teste123', function(req, res, next) {
  const cypherQuery = "MATCH p=(n)-[r:RECOMMENDED_M1]-(c) WHERE n.name = 'andréa sabedra bordin' RETURN p ORDER BY r.combined_net DESC";
  db.query(cypherQuery, {
      personName: "Bob"
    }, function(err, results) {
      if (err) {
        console.error('Error saving new node to database:', err);
      } else {
        db.cypher({
            query: "MATCH p=(n)-[r:RECOMMENDED_M1]-(c) WHERE n.name = 'andréa sabedra bordin' RETURN p ORDER BY r.combined_net DESC",            
        }, function(err, results){
            var result = results[0];
            if (err) {
                console.error('Error saving new node to database:', err);
            } else {
                console.log('Node saved to database with id:', result['n']['_id']);
            }
        });
        res.send(results);
      }
  });
  /*request({
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization' : 'Basic ' + (Buffer.from('wolgan:b.8Ta7H6xRbwU1.VTysLTSwMFOSGVaO').toString('base64'))
    },
    uri: 'http://brandy-teal-nicolas-cape.graphstory.cloud:7474/db/data/transaction/commit',
    method: 'POST',
    body: JSON.stringify(
        {
          "statements":
          [
            {
              "statement": "MATCH p=(n)-[r:RECOMMENDED_M1]-(c) WHERE c.campus = 'alegrete' and n.campus = 'alegrete' and id(n) < id(c) and n.proj_count > 0 RETURN p ORDER BY r.value DESC",
              "resultDataContents":["graph"]
            }
          ]
        }
      )
  }, (err, result) => {    
    if (err) {
      return res.send(err);
    } 
    return res.json(result);
  })*/
  /*const driver = neo4j.driver("http://brandy-teal-nicolas-cape.graphstory.cloud/", 
    neo4j.auth.basic("brandy_teal_nicolas_cape", "YhHpVgtEbUMaQ9kYjiU9")
  );
  const session = driver.session();
  session
  .run("MATCH p=(n)-[r:{relationParam}|:COAUTHORED_WITH] WHERE n.name = '{nameParam}' and n.proj_count > 0 RETURN p ORDER BY r.{orderParam} DESC LIMIT 100",
    {
      relationParam: relation,
      nameParam: name,
      orderParam: order
    }
  )
  .subscribe({
    onNext: function (record) {
      res.send(record)
    },
    onCompleted: function () {
      session.close();
    },
    onError: function (error) {
      res.send(error)
      console.log(error);
    }
  });*/
});
router.get('/recommendation-graph', function(req, res, next) {
  const options = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization' : Buffer.from('neo4j:admin').toString('base64')
    },
    json: true,
    body: {
      "statements":
      [
        {
          "statement": "MATCH p=(n)-[r:RECOMMENDED_M1]-(c) " + 
          "WHERE c.campus = 'alegrete' and n.campus = 'alegrete' and id(n) < id(c) and n.proj_count > 0 RETURN p ORDER BY r.total DESC",
          "resultDataContents":["graph"]
        }
      ]
    },
   /* form: {
      "statements":
      [
        {
          "statement": "MATCH p=(n)-[r:RECOMMENDED_M1]-(c) " + 
          "WHERE c.campus = 'alegrete' and n.campus = 'alegrete' and id(n) < id(c) and n.proj_count > 0 RETURN p ORDER BY r.total DESC",
          "resultDataContents":["graph"]
        }
      ]
    }*/
  };

  return request.post(
    'http://localhost:7474/db/data/transaction/commit',
    options,
    function(error, result){
      console.log(error)
      console.log(result)
      return res.json(result.toJSON().body)
    }
  );
});
router.get('/individual-graph/:name', function(req, res, next) {
  const options = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization' : Buffer.from('neo4j:admin').toString('base64')
    },
    json: true,
    body: {
      "statements":
      [
        {
          "statement": "MATCH p=(n)-[r:RECOMMENDED_M1]-(c) " + 
          "WHERE r.total > 0.000 and id(n) < id(c) and (c.name = '"+req.params.name+"' or n.name = '"+ req.params.name + "') RETURN p ORDER BY r.total DESC limit 5",
          "resultDataContents":["graph"]
        }
      ]
    },
  };

  return request.post(
    'http://localhost:7474/db/data/transaction/commit',
    options,
    function(error, result){
      return res.json(result.toJSON().body)
    }
  );
});
module.exports = router;
