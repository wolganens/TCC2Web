import React from 'react';
import {
  Button,    
  FormGroup, 
  Label, 
  Input,   
  Form
} from 'reactstrap';

export default class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      edges: [],
      loading: true,
      metric: 'bc'
    }
    this.buildGraph = this.buildGraph.bind(this);
    this.toggleFullScreen = this.toggleFullScreen.bind(this);
    this.handleMetricChange = this.handleMetricChange.bind(this);
    this.setGraph = this.setGraph.bind(this);
  }
  componentWillMount() {    
    fetch('http://localhost:8080/researchers', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(res => res.json())
    .then(researchers => {
      this.setGraph(researchers);
    })
  }
  setGraph(researchers) {
    if (!Array.isArray(researchers)) {
      researchers = [researchers]
    }
    const nodes = [];
    const edges = [];
    const idMap = {};
    researchers.forEach(r => {      
      nodes.push({
        index: r.id,
        name: r.name.split(" ")[0] + ' - ' +r.campus.campus.split(" ")[0],
        group: r.campus.campus 
      })
      r.related.forEach(rel => {        
        const finded = nodes.find(n => n.index === rel.id);        
        if (!finded) {
          nodes.push({
            index: rel.id,
            name: rel.name.split(" ")[0] + ' - ' +rel.campus.campus.split(" ")[0],
            group: r.campus.campus
          })
        }          
      })
    });
    researchers.forEach(r => {
      r.related.forEach(rel => {
        const e = {
          source: r.id,
          target: rel.id,
          bc: rel.RelatedResearcher.bc,
          cs: rel.RelatedResearcher.cs
        }
        edges.push(e);
      });
    });
    nodes.forEach((d, i) => {
      idMap[d.index] = i;
    });
    edges.forEach( d => {
      d.source = idMap[d.source];
      d.target = idMap[d.target];
    })
    this.setState((prevState, props) =>{
      return {
        nodes,
        edges,
        loading: false
      }
    });
  }
  handleMetricChange(e) {
    this.svg && this.svg.selectAll('*').remove();
    const {value: metric} = e.target;
    this.setState((prevState, props) => {
      return {
        metric
      }
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
        links: this.state.edges.filter(e => e[this.state.metric] > 0.000)
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
	componentDidMount() {
   /* if (this.node) {
      if (window.d3) {
        const select = window.d3.select(this.node);
        if (select) {
          select.selectAll('svg').remove();
          select.remove();
        }
      }
    }*/
    this.svg && this.svg.selectAll('*').remove();
		return !this.state.loading && this.buildGraph();
	}
  componentDidUpdate() {
    /*if (this.node) {
      if (window.d3) {
        const select = window.d3.select(this.node);
        if (select) {
          select.selectAll('svg').remove();
          select.remove();
        }
      }
    }*/
    this.svg && this.svg.selectAll('*').remove();
    return !this.state.loading && this.buildGraph();
  }
  componentWillUnmount () {
    const select = window.d3.select(this.node);
    select.selectAll('svg').remove();  
  }
  toggleFullScreen() {    
    if (!document.mozFullScreen && !document.webkitFullScreen) {
      if (this.graph.mozRequestFullScreen) {
        this.graph.mozRequestFullScreen();
      } else {
        this.graph.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else {
        document.webkitCancelFullScreen();
      }
    }
  }
	render() {
		return this.state.loading ? <p>Carregando...</p> : 
    (      
      <div>
        <Form inline>
          <FormGroup>
            <Label for="exampleSelect">Alterar grafo</Label>
            <Input type="select" name="select" id="exampleSelect" onChange={this.handleMetricChange}>
              <option value="bc">ABC</option>
              <option value="cs">CS</option>
            </Input>
            <Button
              color="default"
              onClick={this.toggleFullScreen}>Tela cheia
            </Button>
            <Button
              color="primary">
              Avaliar
            </Button>
          </FormGroup>
        </Form>
        <div ref={node => this.graph = node} id="graph-bg">
          <svg id="graph-svg" ref={node => this.node = node} style={{width: '100%', height: 'calc(100vh - 67px)'}}>
          </svg>
        </div>
      </div>
    )
	}
}