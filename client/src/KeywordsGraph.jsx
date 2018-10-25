import React from 'react';
import * as d3 from 'd3';
import './graph.css';
import ProfileModal from './ProfileModal.jsx';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom'

export default class KeywordsGraph extends React.Component {
  constructor(props) {
    super(props);
    this.relation_metric_map = {
      KEYWORD_RECOMMENDED_TO: 'cosine_value',
      BIB_RECOMMENDED_TO: 'abc_value',
      COAUTHORED_WITH: 'norm_value',
      NETWORK_RECOMMENDED_TO: 'norm_value'
    }
    this.fetchedProfiles = {};
    this.state = {
      data: [],
      edges: [],
      nodes: [],
      metric: 'value',
      relation: this.props.relation,
      open: false,
      selected: null
    }    
    this.renderGraph = this.renderGraph.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.removeSelected = this.removeSelected.bind(this);
    
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
              "statement": "MATCH p=(n)-[r:" + this.state.relation + "|:COAUTHORED_WITH]-() WHERE n.name = '" + this.props.user.name + "' and n.proj_count > 0 RETURN p ORDER BY r." + this.relation_metric_map[this.state.relation]+ " DESC LIMIT 10",
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
          if (!nodes.find(f => f.name === n.properties.name)) {
            nodes.push({
              'name' : n.properties.name,
              'campus' : n.properties.campus,
              'proj_count' : n.properties.proj_count,
              'index' : n.id,
              'r' : 15              
            });
          }
        })
        r.graph.relationships.forEach(r => {
          const exists = edges.find(l => (
              (l.source === r.startNode && l.target === r.endNode) ||
              (l.source === r.endNode && l.target === r.startNode)
            ) 
          )          
          if (exists) {
            if (r.type === 'COAUTHORED_WITH') {
              exists.coauthors = true;              
            } else {
              r.value = r.properties[this.relation_metric_map[this.state.relation]];
            }
          } else {
            edges.push({
              source: r.startNode,
              target: r.endNode,
              value: r.type === 'COAUTHORED_WITH' ? 1: r.properties[this.relation_metric_map[this.state.relation]],
              "l": 100,
              "coauthors": r.type === 'COAUTHORED_WITH'
            });
          }
        });
      });
      const idMap = {};
      
      nodes.forEach((d, i) => {
        idMap[d.index] = i;
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
      this.renderGraph();     
    });    
  }
  componentDidUpdate() {
    this.renderGraph();
  }
  removeSelected() {
    this.setState((prevState, props) => {
      return {
        selected: null
      }
    })
  }
  renderGraph() {        
    const width = window.screen.width;
    const body = d3.select("body").node();
    const navbar = d3.select('#navbar').node();
    const navStyle = getComputedStyle(navbar);
    const height = body.offsetHeight - (navbar.offsetHeight + parseInt(navStyle.marginTop) + parseInt(navStyle.marginBottom));
    const nodesData = this.state.nodes;
    const linksData = this.state.edges;
    
    const link = d3.select("svg")
      .attr('height', height)
      .selectAll("line")
      .data(linksData)
      .enter()
      .append("line")
      .attr("stroke-width", l => l.coauthors ? (l.value) : (3 * l.value))
      .attr("stroke", l => l.coauthors ? 'blue' : 'black')
      .on("mouseover", linkHover)
      .on("mouseout", linkHoverOut)    
   
    const d3_drag = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
   
    const node = d3.select("svg").selectAll('.nodes')
    .data(nodesData)
    .enter()
    .append('g')
    .attr('class', 'nodes')    
    .call(d3_drag)
    .on("click", clicked)
    .on("dblclick", d => {
      if (this.fetchedProfiles.hasOwnProperty(d.name)) {
        return this.setState((prevState,props) => {
          return {
            selected: this.fetchedProfiles[d.name]
          }
        })
      } else {
        fetch('http://localhost:8000/researchers/profile_by_name/' + d.name , {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })
        .then(res => res.json())
        .then(profile => {
          this.fetchedProfiles[d.name] = profile;
          this.setState((prevState, props) => {return {selected: profile}})          
        })
      }
    })
    .on("mouseout", mouseout)
    .on("mouseover", mouseover);

    node.append('circle')
    .attr("r", 18)    
    .attr("class", d => "node " + d.campus.replace(/ /g,"_"))
    
    node.append("text")
    .attr("dx", -10)
    .attr("dy", 3)
    .text( d => d.name.split(' ').reduce( (a, b) => a[0] + '. ' + b[0] ));
    
    
    function linkHoverOut(d) {
      d3.select("#link-details").attr("class", "hidden");
    }
    function linkHover(d) {
      d3.select("#node-details").attr("class", "hidden");
      d3.select("#link-details").attr("class", "");
      d3.select("#link-details").text("Similaridade: " + d.value);
    }
    function mouseout(d) {
      d3.select("#node-details").attr("class", "hidden");
      d3.selectAll("line").classed("hidden", false);
      d3.selectAll("circle").classed("hidden", false);
      d3.select("#tooltip-text").classed("hidden", true);
    }
    function mouseover(d) {      
      d3.select("#node-details").select("#name").text("Pesquisador: " + d.name);
      d3.select("#node-details").select("#campus").text("Campus: " + d.campus);
      d3.select("#node-details").attr("class", "");
      d3.selectAll("line").each(function(v,i) {
        if (v.target !== d && v.source !== d) {
          d3.select(this).classed("hidden", true);
        }
      })

      const tooltip = d3.select("#tooltip-text");
      tooltip.text(`${d.name} - ${d.campus}`);
      tooltip.style("left", `${d.x}px`);
      tooltip.style("top", `${d.y}px`);
      tooltip.classed("hidden", false);
    }

    function clicked(d) {
      const clicked_circle = d3.select(this).select('circle');
      d3.selectAll('text').text( l => l.name.split(' ').reduce( (a, b) => a[0] + '. ' + b[0] ));
      d3.selectAll(".conected").classed("conected", false);
      d3.selectAll("line").classed("linkSelected", false);
      if (!clicked_circle.classed("selected")) {
        d3.selectAll(".selected").classed("selected", false);
        clicked_circle.classed("selected", true);
        d3.selectAll("line")
        .filter(function(v, i) {
          if(d === v.source) {
            node.each(function(vj, j) {
              if(v.target === vj) {
                d3.select(this).select('text')
                .attr('class', "sim_text")              
                .text(v.value);
              }
            });
            return true;
          } else if(d === v.target) {
            node.each(function(vj, j) {
              if(v.source === vj) {
                d3.select(this).select('text')
                .attr('class', "sim_text")              
                .text(v.value);                
              }
            });
            return true;
          } else {
            return false;
          }
        }).classed("linkSelected", true);
      } else {
        clicked_circle.classed("selected", false);
      }
    }

    const simulation = d3.forceSimulation()
    .force("link", d3.forceLink()
    .distance(d => d.l)
    .iterations(2))
    .force("collide", d3.forceCollide().radius(20).strength(0.3).iterations(5))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("x", d3.forceX().strength(0.05).x(width / 2))
    .force("y", d3.forceY().strength(0.05).y(height / 2))
    .force("center", d3.forceCenter(width / 2, height / 2));
   
    simulation
    .nodes(nodesData)
    .on("tick", ticked);

    simulation.force("link")
    .links(linksData)
    .id(d => d.index);
   
    function ticked() {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
      node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    }
   
    function dragstarted(d) {
      if(!d3.event.active) simulation.alphaTarget(0.3).restart();
      d3.event.subject.fx = d3.event.subject.x;
      d3.event.subject.fy = d3.event.subject.y;
    }

    function dragged(d) {
      d3.event.subject.fx = d3.event.x;
      d3.event.subject.fy = d3.event.y;
    }
   
    function dragended(d) {
      if(!d3.event.active) simulation.alphaTarget(0);
      d3.event.subject.fx = null;
      d3.event.subject.fy = null;
    }
  }
  render() {
    return (
      <div id="wrapper">
        <Button style={{position: "absolute"}} tag={Link} to="/evaluation" color="primary">Avaliar Recomendações</Button>
        <div id="tooltip-text" className="hidden"></div>
        {this.state.selected && <ProfileModal toggle={this.removeSelected} selected={this.state.selected}/>}          
        <svg ref={node => this.graph = node} id="graph" width="100%">
        </svg>
      </div>
    )
  }
}