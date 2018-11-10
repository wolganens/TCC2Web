import React from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom'
import ProfileModal from './ProfileModal.jsx';
import { FormGroup, Label, Input, FormText } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import * as d3 from 'd3';
import './graph.css';

export default withRouter(class RecommendaionGraph extends React.Component {
  constructor(props) {
    super(props);
    /*Estado do componente*/
    this.state = {
      edges: [],
      nodes: [],
    }
    /*Permite acesso a instância do componente pela variavel "this" nos métodos abaixo*/
    this.renderGraph = this.renderGraph.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.toggle = this.toggle.bind(this);
  }  
  componentWillMount() {
    /*Requisita as relações de similaridade do usuário autenticado*/    
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
              "statement": "MATCH p=(n)-[r:RECOMMENDED_M1]-(c) " + 
              "WHERE n.name = '"+ this.props.selectedNode.name + "' RETURN p ORDER BY r.value DESC limit 15",
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
              'lattes': n.properties.lattes
            });
          }
        })
        r.graph.relationships.forEach(r => {          
          edges.push({
            source: r.startNode,
            target: r.endNode,
            value: r.properties.value,
            "l": 20,
            "coauthors": r.properties.coauthors
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
  componentDidUpdate() {
    this.renderGraph();
  }
  renderGraph() {
    /*Largura do svg*/
    const width = window.screen.width;
    const body = d3.select("body").node();
    const navbar = d3.select('#navbar').node();
    const navStyle = getComputedStyle(navbar);
    /*Computa a altura do svg com base na altura do documento - altura da barra de navegação*/
    const height = body.offsetHeight - 
    (navbar.offsetHeight + parseInt(navStyle.marginTop, 10) + parseInt(navStyle.marginBottom, 10));
    /*Dados dos vértices e arestas do grafo*/
    const linksData = this.state.edges;    
    const nodesData = this.state.nodes;
    const link = d3.select("svg")
      .selectAll("line")
      .data(linksData)
      .enter()
      .append("line")
      .attr("stroke-width", l => l.coauthors ? (l.value) : (2 * l.value))
      .attr("stroke", l => l.coauthors ? 'red' : 'black');
    
    const linkLabel = d3.select("svg")
      .selectAll("text")
      .data(linksData)
      .enter()
      .append("text")
      .attr("x", d => d.target.x)
      .attr("y", d => d.target.y)
      .text(d => d.value);
   
    const d3_drag = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
   
    const node = d3.select("svg")
    .selectAll('.nodes')
    .data(nodesData)
    .enter()
    .append('g')
    .attr('class', 'nodes')    
    .call(d3_drag)
    /*Ao clicar uma vez sob o nó, exibe as similaridades e marca os vizinhos*/
    .on("click", (n) => {
      
    })
    .on("dbclick", (n) => {
      
    })
    .on("mouseout", mouseout)
    .on("mouseover", mouseover);

    /*Círculos dos nós com a classe do campus para estilização da cor do nó via graph.css*/
    node.append('circle')
    /*Raio do círculo*/
    .attr("r", 20)
    .attr("class", d => "big node " + d.campus.replace(/ /g,"_"))
    /*Abreviatura do nome do pesquisador do nó*/
    node.append("text")
    .text(d => getAbrrName(d.name))
    .attr("dx", nodeLabelDx)
    .attr("dy", 3);
    /*Deslocamento do rótulo do nó com base no tamanho do nome*/
    function nodeLabelDx() {
      return -(this.getComputedTextLength() / 2);
    }    
    function mouseout(d) {
      d3.select("#node-details").attr("class", "hidden");
      d3.selectAll("line").classed("hidden", false);
      d3.selectAll("circle").classed("hidden", false);
      d3.select("#tooltip-text").classed("hidden", true);
    }
    function mouseover(d) {
      d3.select("#node-details").attr("class", "");
      d3.selectAll("line").each(function(v,i) {
        if (v.target !== d && v.source !== d) {
          d3.select(this).classed("hidden", true);
        }
      });

      const tooltip = d3.select("#tooltip-text");
      tooltip.text(`${d.name} - ${d.campus}`);
      tooltip.style("left", `${d.x}px`);
      tooltip.style("top", `${d.y}px`);
      tooltip.classed("hidden", false);
    }

    function getAbrrName(name) {
      return name.split(' ').filter((n,i) => {return i < 2}).map(n => n[0]).join('. ');
    }

    const simulation = d3.forceSimulation()
    .force("link", d3.forceLink()
    .distance(d => d.l/2)
    .iterations(1))
    .force("collide", d3.forceCollide().radius(50).strength(1).iterations(5))
    .force("charge", d3.forceManyBody().strength(-110))
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
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

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
  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }
  render() {
    return (
      <div id="wrapper">
        <div id="tooltip-text" className="hidden"></div>
        <svg ref={node => this.graph = node} id="graph" width="100%">
        </svg>
        <div id="caption">
          <ul>
            <li className="alegrete">Alegrete</li>
            <li className="uruguaiana">Uruguaiana</li>
            <li className="bagé">Bagé</li>
            <li className="caçapava_do_sul">Caçapava do Sul</li>
            <li className="dom_pedrito">Dom Pedrito</li>
            <li className="itaqui">Itaqui</li>
            <li className="sao_borja">São Borja</li>
            <li className="sao_gabriel">São Gabriel</li>
            <li className="jaguarao">Jaguarão</li>
            <li className=""></li>
          </ul>
        </div>
      </div>
    )
  }
})