import React, { Component } from 'react';
import { Link, Route, Switch,withRouter } from 'react-router-dom';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Container,
  Button, Form, FormGroup, Label, Input
  } from 'reactstrap';

import Help from './Help.jsx';
import RecommendationGraph from './RecommendationGraph.jsx';
import IndividualGraph from './IndividualGraph.jsx';
import Profiles from './Profiles.jsx';
import RelationsTable from './RelationsTable.jsx';
import Evaluation from './Evaluation.jsx';
import Auth from './Auth.jsx';

class App extends Component {
  constructor(props) {    
    super(props);
    this.state = {
      isOpen: false,
      researchers: [],
      relations: [],      
      selectedNode: null,
      user: JSON.parse(localStorage.getItem('user') || null),
      loading: false
    }
    this.setSelectedNode = this.setSelectedNode.bind(this);
    this.setUser = this.setUser.bind(this);
  }
  setSelectedNode(selectedNode) {
    return this.setState((prevState, props) => {
      return {
        selectedNode
      }
    });
  }
  setUser(user) {
    return this.setState((prevState, props) => {
      return {
        user
      }
    });
  }
  componentWillMount() {    
    /*if (this.state.user) {      
      const token = localStorage.getItem('token');
      if (!this.state.user) {
        
      }
      
      fetch('/researchers/recommendation-graph', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then(data => data.json())
      .then(data => {
        const relations = [];
        data.results[0].data.forEach(d => {
          let relation_exists = false;        
          relation_exists = relations.find(a => 
            (a.a_name === d.graph.nodes[0].properties.name && a.b_name === d.graph.nodes[1].properties.name) ||
            (a.a_name === d.graph.nodes[1].properties.name && a.b_name === d.graph.nodes[0].properties.name)
          );
          
          const rel_props = d.graph.relationships[0].properties;          
          if (!relation_exists) {
            relation_exists = {
              a_name: d.graph.nodes[0].properties.name,
              b_name: d.graph.nodes[1].properties.name,
              total: rel_props.total
            }
            relations.push(relation_exists);
          }
        });
        this.setState((prevState, props) => {
          return {
            loading: false,
            relations,
          }
        })
      })
    }*/
  }  
   
  render() {
    return <p>Pedimos por gentileza que realize as avaliações das recomendações em alguns instantes.</p>
    return (    
      <div>
        <Navbar id="navbar" color="light" light expand="md">
          <NavbarBrand href="/help"><span className="brand">Sistema de Recomendação de pesquisadores</span></NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                  <NavLink tag={Link} to="/help">Instruções</NavLink>
              </NavItem>
              <NavItem>
                  <NavLink onClick={(e) => {
                    e.preventDefault();
                    this.setSelectedNode(this.state.user);
                    this.props.history.push('/individualGraph');
                  }} href="/individualGraph">Minhas Recomendações</NavLink>
              </NavItem>
              {/*<NavItem>
                  <NavLink tag={Link} to="/relations">Tabela de Recomendações</NavLink>
              </NavItem>*/}
              <NavItem>
                  <NavLink tag={Link} to="/graph">Grafo de Recomendações</NavLink>
              </NavItem>
              {/*<NavItem>
                <NavLink tag={Link} to="/profiles">Perfis</NavLink>
              </NavItem>*/}
            </Nav>
          </Collapse>
        </Navbar>
        <Switch>
          <Route exact path='/help' component={
            (props) => <Help user={this.state.user}/>
          }/>
          <Route exact path='/auth/:token' component={
            (props) => <Auth
              user={this.state.user}
              setUser={this.setUser}
          />
          }/>
          <Route exact path='/relations' component={
            (props) => <RelationsTable loading={this.state.loading} relations={this.state.relations} />
          }/>
          <Route exact path='/evaluation' component={
            (props) => <Evaluation user={this.state.user}/>
          }/>
          <Route exact path='/graph' component={
            (props) => <RecommendationGraph user={this.state.user} setSelectedNode={this.setSelectedNode}/>
          }/>
          <Route exact path='/individualGraph' component={
            (props) => <IndividualGraph 
              selectedNode={this.state.selectedNode || this.state.user}
              resetNode={this.setSelectedNode}
              user={this.state.user}
            />
          }/>
          <Route exact path='/profiles/:name?' component={Profiles} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);
