import React from 'react';
import * as d3 from "d3";
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
    this.renderGraph = this.renderGraph.bind(this);
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
              "statement": "MATCH p=()-[r:KEYWORD_RECOMMENDED_TO]-() RETURN p LIMIT 250",
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
            'index' : n.id,
            'r' : 15
          });
        })
        r.graph.relationships.forEach(r => {
          edges.push({
            source: r.startNode,
            target: r.endNode,
            value: r.properties.cosine_value,
            "l": 250
          });
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
  renderGraph() {    
    // 1. 描画用のデータ準備
    const width = window.screen.width
    const height = window.screen.height    
    const nodesData = this.state.nodes;
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    var linksData = this.state.edges;
    // 2. svg要素を配置
    var link = d3.select("svg")
      .selectAll("line")
      .data(linksData)
      .enter()
      .append("line")
      .attr("stroke-width", l => 3 + (l.value * l.value))
      .attr("stroke", "black")
      .on("mouseover", linkHover)
      .on("mouseout", linkHoverOut)
   
    var d3_drag = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
   
    var node = d3.select("svg")
    .selectAll("circle")
    .data(nodesData)
    .enter()
    .append("circle")
    .attr("r", function(d) { return d.r })
    .attr("class", d => "node " + d.campus.replace(/\ /g,"_"))    
    .call(d3_drag)
    .on("click", clicked)
    .on("mouseout", mouseout)
    .on("mouseover", mouseover);

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
    }
    function mouseover(d) {
      d3.select("#node-details").select("#name").text("Pesquisador: " + d.name);
      d3.select("#node-details").select("#campus").text("Campus: " + d.campus);
      d3.select("#node-details").attr("class", "");
    }

    function clicked(d) {      
      d3.selectAll(".selected").classed("selected", false);
      d3.selectAll(".conected").classed("conected", false);
      d3.selectAll("line").classed("linkSelected", false);
   
      d3.select(this).classed("selected", true);      
      d3.selectAll("line")
      .filter(function(v, i) {
        if(d === v.source) {
          node.each(function(vj, j) {
            if(v.target === vj) d3.select(this).classed("conected", true);
          });
          return true;
        } else if(d === v.target) {
          node.each(function(vj, j) {
            if(v.source === vj) d3.select(this).classed("conected", true);
          });
          return true;
        }
      }).classed("linkSelected", true);
    }
   
    
    var simulation = d3.forceSimulation()
      .force("link", d3.forceLink()
        .distance(function(d) { return d.l; })
        .iterations(2))
      .force("collide",
        d3.forceCollide()
        .radius(25)
        .strength(5)
        .iterations(10))
      .force("charge", d3.forceManyBody().strength(-50))
      .force("x", d3.forceX().strength(0.01).x(width / 2))
      .force("y", d3.forceY().strength(0.01).y(height / 2))
      .force("center", d3.forceCenter(width / 2, height / 2));
   
    simulation
      .nodes(nodesData)
      .on("tick", ticked);
    simulation.force("link")
   
      .links(linksData)
      .id(function(d) { return d.index; });
   
    // 4. forceSimulation 描画更新用関数
    function ticked() {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
      node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
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
        <div id="link-details" className="hidden">
        </div>
        <div id="node-details" className="hidden">
          <p id="name"></p>
          <p id="campus"></p>
        </div>
        <svg ref={node => this.graph = node} id="graph" width="100%" height="100%">
        </svg>
      </div>
    );
  }
}