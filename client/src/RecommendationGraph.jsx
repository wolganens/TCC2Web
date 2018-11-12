import React from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom'
import ProfileModal from './ProfileModal.jsx';
import { Col, Row} from 'reactstrap';
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
      loading: false,
      filter: ''
    }
    /*Permite acesso a instância do componente pela variavel "this" nos métodos abaixo*/
    this.renderGraph = this.renderGraph.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.removeSelected = this.removeSelected.bind(this);
  }  
  componentDidMount() {
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
              "WHERE id(n) < id(c) and n.proj_count > 0 RETURN p ORDER BY r.value DESC LIMIT 200",
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
            "l": 15,
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
  removeSelected() {
    this.setState((prevState, props) => {
      return {
        selected: null
      }
    })
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
    let linksData = [];
    let nodesData = [];
    /*if (this.state.filter.trim()) {
      const rgx = new RegExp(this.state.filter, 'i');
      linksData = this.state.edges.filter(n => {
        if (n.source.name.indexOf(this.state.filter) !== -1) {
          return true;
        } else if (n.target.name.indexOf(this.state.filter) !== -1) {
          return true;
        } else {
          return false;
        }
      });
      nodesData = this.state.nodes.filter(n => {
        let finded = false;
        linksData.forEach(l => {
          if (l.source.name === n.name || l.target.name === n.name) {
            finded = true;
          }
        });
        if (finded) {
          return true;
        }
        return false;
      });
      
    } else {*/
      linksData = this.state.edges;
      nodesData = this.state.nodes;
    /*}*/
    console.log(linksData)
    const link = this.link = d3.select("svg")
      .attr('height', height - 30)
      .selectAll("line")
      .data(linksData)
      .enter()
      .append("line")
      .attr("stroke-width", l => l.coauthors ? (l.value) : (2 * l.value))
      .attr("stroke", l => l.coauthors ? 'red' : '#555');
   
    const d3_drag = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
   
    const node = this.node = d3.select("svg")
    .selectAll('.nodes')
    .data(nodesData)
    .enter()
    .append('g')
    .attr('class', 'nodes')    
    .call(d3_drag)
    /*Ao clicar uma vez sob o nó, exibe as similaridades e marca os vizinhos*/
    .on("click", (n) => {
      this.props.setSelectedNode(n);
      this.props.history.push('/individualGraph');
    })
    .on("dbclick", (n) => {
      this.props.setSelectedNode(n);
      this.props.history.push('/individualGraph');
    })
    .on("mouseout", mouseout)
    .on("mouseover", mouseover);

    /*Círculos dos nós com a classe do campus para estilização da cor do nó via graph.css*/
    node.append('circle')
    /*Raio do círculo*/
    .attr("r", 8)
    .attr("class", d => "node " + d.campus.replace(/ /g,"_"))
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
    .distance(d => d.l)
    .iterations(1))
    .force("collide", d3.forceCollide().radius(15).strength(.5).iterations(5))
    .force("charge", d3.forceManyBody().strength(-30))
    .force("x", d3.forceX().strength(.5).x(width / 2))
    .force("y", d3.forceY().strength(2).y(height / 2))
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

  render() {
    return (
      this.state.loading ? (<p>Carregando...</p>) : (
        <div id="wrapper">
          <div style={{position: "absolute"}}>
            <Row>
              <Col xs="auto">
                <Button tag={Link} to="/evaluation" color="primary">Avaliar Recomendações</Button>
              </Col>
              <Col xs="auto">
                <Button onClick={() => {
                  this.props.setSelectedNode({name: this.props.user.name});
                  this.props.history.push('/individualGraph');
                }} type="submit">Ver minhas recomendações</Button>
              </Col>
            </Row>
          </div>
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
              <li className="santana_do_livramento">S. do Livramento</li>
            </ul>
          </div>
        </div>
      )
    )
  }
})