import React from 'react';
import Neo4jd3 from 'neo4jd3_extended';
import './graph.css';

export default class KeywordsGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      edges: [],
      nodes: [],
      metric: 'value'
    }    
  }  
  componentDidMount() {
    fetch('http://localhost:7474/db/data/transaction/commit', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization' : btoa('neo4j:admin')
      },
      'body': JSON.stringify({
        "statements":
          [
            {
              "statement": "MATCH p=()-[r:KEYWORD_RECOMMENDED_TO]-() RETURN p LIMIT 50",
              "resultDataContents":["graph"]
            }
          ]
      })
    })
    .then(res => res.json())
    .then(data => {      
      const nodes = [];
      const edges = [];      
      data.results[0].data.forEach(r => { 
        r.graph.nodes.forEach(n => {
          nodes.push({
            'name' : n.properties.name,
            'campus' : n.properties.campus,
            'proj_count' : n.properties.proj_count,
            'id' : n.id
          });
        })
        r.graph.relationships.forEach(r => {
          edges.push({
            source: r.startNode,
            target: r.endNode,
            value: r.properties.cosine_value
          });
        });
      });
      const idMap = {};
      
      nodes.forEach((d, i) => {
        idMap[d.id] = i;
      });
      edges.forEach(l => {
        l.source = idMap[l.source];
        l.target = idMap[l.target];
      })
      this.setState((prevState, props) => {
        return {
          nodes,
          edges
        }
      })
      if (window.NeoVis) {
        var NeoVis = window.NeoVis;
        var viz;        
        var config = {
            container_id: "graph",
            server_url: "bolt://localhost:7687",
            server_user: "neo4j",
            server_password: "admin",
            labels: {
                "Researcher": {
                    "caption": "name",
                    "size": "proj_count",
                    "community": "campus"
                }
            },
            relationships: {
                "INTERACTS": {
                    "thickness": "weight",
                    "caption": false
                }
            },
            initial_cypher: "MATCH p=()-[r:KEYWORD_RECOMMENDED_TO]-() RETURN p LIMIT 50"
        };
        viz = new NeoVis.default(config);
        console.log(viz)
        viz.render();        
      }
    });    
  }  
  render() {
    return (
      <div ref={node => this.graph = node} id="graph">        
      </div>
    );
  }
}