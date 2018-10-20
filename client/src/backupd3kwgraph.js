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
    this.buildGraph = this.buildGraph.bind(this);
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
      this.buildGraph();
    });    
  }
  buildGraph() {
    if (window.d3) {
      const d3 = window.d3;
      const width = window.screen.width;      
      const height = window.screen.height - 70;
      const color = d3.scaleOrdinal(d3.schemeCategory10);
      const label = {
        'nodes': [],
        'links': []
      };
      const graph = {
        nodes: this.state.nodes,
        links: this.state.edges
      };
      graph.nodes.forEach(function(d, i) {        
        label.nodes.push({node: d});
        label.nodes.push({node: d});
        label.links.push({
          source: i * 2,
          target: i * 2 + 1
        });
      });
      var labelLayout = d3.forceSimulation(label.nodes)
      .force("charge", d3.forceManyBody().strength(-50))
      .force("link", d3.forceLink(label.links).distance(0).strength(2));      
      
      var graphLayout = d3.forceSimulation(graph.nodes)
      .force("charge", d3.forceManyBody().strength(-3000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(1))
      .force("y", d3.forceY(height / 2).strength(1))
      .force("link", d3.forceLink(graph.links).id( d => d.index ).distance(50).strength(1))
      .on("tick", ticked);      
      var adjlist = [];

      graph.links.forEach(function(d) {
        adjlist[d.source.index + "-" + d.target.index] = true;
        adjlist[d.target.index + "-" + d.source.index] = true;
      });      
      function neigh(a, b) {
        return a === b || adjlist[a + "-" + b];
      }


      var svg = this.svg = d3.select("#graph-svg").attr("width", width).attr("height", height);
      var container = svg.append("g");

      svg.call(
        d3.zoom()
        .scaleExtent([.1, 4])
        .on("zoom", function() { container.attr("transform", d3.event.transform); })
      );

      var link = container.append("g").attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", "1px");
      var node = container.append("g").attr("class", "nodes")
      .selectAll("g")
      .data(graph.nodes)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("fill", (d, i) => color(i))

      node.on("mouseover", focus).on("mouseout", unfocus);

      node.call(
        d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      );
      var labelNode = container.append("g").attr("class", "labelNodes")
      .selectAll("text")
      .data(label.nodes)
      .enter()
      .append("text")
      .text(function(d, i) { return i % 2 === 0 ? "" : d.node.name; })
      .style("fill", "white")
      .style("font-family", "Arial")
      .style("font-size", 12)
      .style("pointer-events", "none"); // to prevent mouseover/drag capture

      node.on("mouseover", focus).on("mouseout", unfocus);
      function ticked() {

        node.call(updateNode);
        link.call(updateLink);

        labelLayout.alphaTarget(0.3).restart();
        labelNode.each(function(d, i) {
          if(i % 2 === 0) {
            d.x = d.node.x;
            d.y = d.node.y;
          } else {
            var b = this.getBBox();

            var diffX = d.x - d.node.x;
            var diffY = d.y - d.node.y;

            var dist = Math.sqrt(diffX * diffX + diffY * diffY);

            var shiftX = b.width * (diffX - dist) / (dist * 2);
            shiftX = Math.max(-b.width, Math.min(0, shiftX));
            var shiftY = 16;
            this.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
          }
        });
        labelNode.call(updateNode);

      }

      function fixna(x) {
        if (isFinite(x)) return x;
        return 0;
      }

      function focus(d) {
        var index = d3.select(d3.event.target).datum().index;
        node.attr("class", function(o) {
          return neigh(index, o.index) ? '' : 'hidden';
        });
        labelNode.attr("class", function(o) {
          return neigh(index, o.node.index) ? "": "hidden";
        });
        link.attr("class", function(o) {
          return o.source.index === index || o.target.index === index ? '' : 'hidden';
        });
      }

      function unfocus() {
        labelNode.attr("class", "");
        node.attr("class", "");
        link.attr("class", "");
      }

      function updateLink(link) {
        link.attr("x1", function(d) { return fixna(d.source.x); })
        .attr("y1", function(d) { return fixna(d.source.y); })
        .attr("x2", function(d) { return fixna(d.target.x); })
        .attr("y2", function(d) { return fixna(d.target.y); });
      }

      function updateNode(node) {
        node.attr("transform", function(d) {
          return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
        });
      }

      function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) graphLayout.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }
  }
  render() {
    return (
      <div ref={node => this.graph = node} id="graph">
        <svg id="graph-svg" ref={node => this.node = node} style={{width: '100%', height: 'calc(100vh - 67px)'}}>
        </svg>
      </div>
    );
  }
}