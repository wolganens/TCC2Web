import React from 'react';
import ProfileModal from './ProfileModal.jsx';
import { Button, ListGroup, ListGroupItem, Row, Col, Alert } from 'reactstrap';
import { withRouter, Link } from 'react-router-dom';
import * as d3 from 'd3';
import './graph.css';

export default withRouter(class RecommendaionGraph extends React.Component {
  constructor(props) {
    super(props);
    /*Estado do componente*/
    this.state = {
      edges: [],
      nodes: [],
      selected: null
    }
    /*Permite acesso a instância do componente pela variavel "this" nos métodos abaixo*/
    this.renderGraph = this.renderGraph.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    /*this.componentWillUnmount = this.componentWillUnmount.bind(this);*/
    this.toggle = this.toggle.bind(this);
  }
  /*componentWillUnmount() {
    this.props.resetNode({
      name: this.props.user.name,
      campus: this.props.user.campus
    });
  }*/
  componentWillMount() {
    /*Requisita as relações de similaridade do usuário autenticado*/
    if (this.props.selectedNode) {
      fetch('/researchers/individual-graph/' + this.props.selectedNode.name, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
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
                'id': n.id,
                'lattes': n.properties.lattes
              });
            }
          })
          r.graph.relationships.forEach(r => {
            nodes.forEach(n => {
              if (n.index === r.startNode || n.index === r.endNode) {
                n['value'] = r.properties.total
              }
            })
            edges.push({
              source: r.startNode,
              target: r.endNode,
              value: r.properties.total,
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
  }
  componentDidUpdate() {
    /*this.renderGraph();*/
  }
  handleNodeClick(n) {
    this.props.history.push('/profiles/' + n.name);
  }
  renderGraph() {
    /*Largura do svg*/
    const width = window.screen.width;
    const body = d3.select("body").node();
    const navbar = d3.select('#navbar').node();
    const navStyle = getComputedStyle(navbar);
    /*Computa a altura do svg com base na altura do documento - altura da barra de navegação*/
    const height = this.svgHeight = body.offsetHeight - 
    (navbar.offsetHeight + parseInt(navStyle.marginTop, 10) + parseInt(navStyle.marginBottom, 10));

    const linksData = this.state.edges;    
    const nodesData = this.state.nodes;
    const coauthors = [];
    linksData.forEach(n => {
      if (n.coauthors) {        
        if (nodesData[n.source].name === this.props.selectedNode.name) {
          coauthors.push(nodesData[n.target].name)
        } else {
          coauthors.push(nodesData[n.source].name)
        }
      }
    })
    const link = d3.select("svg")
      .attr('height', height - 30)
      .selectAll("line")
      .data(linksData)
      .enter()
      .append("line")
      .attr("stroke-width", l => l.coauthors ? (l.value) : (2 * l.value))
      .attr("stroke", l => l.coauthors ? 'red' : 'black');
   
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
      this.handleNodeClick(n);
    })
    .on("dbclick", (n) => {
      this.handleNodeClick(n);
    })
    .on("mouseout", mouseout)
    .on("mouseover", mouseover);

    /*Círculos dos nós com a classe do campus para estilização da cor do nó via graph.css*/
    node.append('circle')
    /*Raio do círculo*/
    .attr("r", 25)
    .attr("class", d => "big node " + d.campus.replace(/ /g,"_"))
    /*Abreviatura do nome do pesquisador do nó*/
    node.append("text")
    .text(d => getAbrrName(d.name))
    .attr("dx", nodeLabelDx)
    .attr("dy", 3)
    .on("click", (n) => {
      this.handleNodeClick(n);
    })

    node.append("text")
    .text(d => coauthors.indexOf(d.name) !== -1 ? 'Coautor' : '')
    .attr('class', 'coauthor-text')
    .attr("dx", nodeLabelDx)
    .attr("dy", -35);
    
    node.append("text")
    .text(d => d.name !== this.props.selectedNode.name ? Math.ceil(d.value * 100) + '%' : '')
    .attr('class', 'coauthor-text')
    .attr("dx", nodeLabelDx)
    .attr("dy", 40);

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

      const tooltipName = d3.select("#tooltip-name");
      tooltipName.text(`${d.name}`);
      
      const tooltip = d3.select("#tooltip-text");
      tooltip.style("left", `${d.x + 20}px`);
      tooltip.style("top", `${d.y - 80}px`);
      tooltip.classed("hidden", false);
      
    }

    function getAbrrName(name) {
      const name_parts = name.split(' ');
      return (name_parts[0][0] + '. ' + name_parts[name_parts.length - 1][0]).toUpperCase();
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
    if (!this.props.user) {
      return <Alert color="danger">Nenhuma chave de acesso foi inserida no endereço da página!</Alert>
    }
    return (
      <div id="wrapper" style={{position: "relative"}}>
        <Alert color="info" style={{position: "absolute", top: "0", left:"0", width: "100%"}}>
          Para exibir detalhes de um pesquisador clique uma ou duas vezes sob o vértice (círculo).
        </Alert>
        {this.props.selectedNode.name === this.props.user.name && (
          <div style={{position: "absolute", bottom: "0", left: "0"}}>
            <Button tag={Link} to="/evaluation" color="primary">Avaliar Recomendações</Button>
          </div>
        )}
        <div id="tooltip-text" className="hidden">
          <span id="tooltip-name"></span><br/>
          <span id="tooltip-hint">Clique duas vezes para mais detalhes</span></div>
        <svg ref={node => this.graph = node} id="graph" width="100%"></svg>
      </div>
    )
  }
})