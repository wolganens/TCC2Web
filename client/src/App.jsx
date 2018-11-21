import React, { Component } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
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

class App extends Component {
  constructor(props) {    
    super(props);
    this.state = {
      isOpen: false,
      researchers: [],
      relations: [],
      researcher: null,
      researcherInputValue: '',
      selectedNode: null,
      user: JSON.parse(localStorage.getItem('user') || null),
      tokenError: '',
      loading: false
    }
    this.onResearcherClick = this.onResearcherClick.bind(this);
    this.submitToken = this.submitToken.bind(this);
    this.handleResearchInputChange = this.handleResearchInputChange.bind(this);
    this.setSelectedNode = this.setSelectedNode.bind(this);
  }
  setSelectedNode(selectedNode) {
    return this.setState((prevState, props) => {
      return {
        selectedNode
      }
    });
  }
  componentWillMount() {
    if (this.state.user) {      
      const token = localStorage.getItem('token');
      if (!this.state.user) {
        return fetch('/researchers/profile_by_token/' + token, {
        /*return fetch('https://relatoriotcc2.herokuapp.com/researchers/profile_by_token/' + token, {*/
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })
        .then(res => res.json())
        .then(profile => {
          if (!profile) {
            return this.setState((prevState, props) => {
              return {
                tokenError: 'O código inserido não existe.'
              }
            })
          }          
          this.setState((prevState, props) => {
            return {
              user: profile,
              selectedNode: profile
            }
          })
        })
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
    }
  }
  onResearcherClick(researcher) {
    this.setState({
      researcher
    });
  }
  handleResearchInputChange(event) {
    const { value: researcherInputValue } = event.target;
    
    this.setState({
      researcherInputValue
    })
  }
  submitToken(e) {
    e.preventDefault();
    this.setState((prevState, props) => {
      return {
        loading: true
      }
    });
    const token = e.currentTarget.token.value;
    return fetch('/researchers/profile_by_token/' + token, {
    /*return fetch('https://relatoriotcc2.herokuapp.com/researchers/profile_by_token/' + token, {*/
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(res => res.json())
    .then(profile => {
      if (!profile) {
        return this.setState((prevState, props) => {
          return {
            tokenError: 'O código inserido não existe.'
          }
        })
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(profile));
      this.setState((prevState, props) => {
        return {
          user: profile,
          token,
          loading: false
        }
      })
    })
  }
  render() {
    return (      
      this.state.user ? (
        <div>
          <Navbar id="navbar" color="light" light expand="md">
            <NavbarBrand href="/">TCC2</NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" navbar>
                <NavItem>
                    <NavLink tag={Link} to="/help">Instruções</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/individualGraph">Minhas Recomendações</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/relations">Tabela de Recomendações</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/graph">Grafo de Recomendações</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/profiles">Perfis</NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
          <Switch>
            <Route exact path='/help' component={
              (props) => <Help user={this.state.user}/>
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
              (props) => <IndividualGraph selectedNode={this.state.selectedNode || this.state.user}/>
            }/>
            <Route exact path='/profiles/:name?' component={Profiles} />
          </Switch>
        </div>
      ) : (
        <Container>
          {this.state.loading && <p>Carregando...</p>}
          <Form onSubmit={this.submitToken} method="POST">
            {this.state.user && <p>{this.state.user}</p>}
            <FormGroup>
              <Label  for="exampleEmail">Código de acesso</Label>
              <Input readonly={this.state.loading} type="text" required name="token" id="token" placeholder="Digite seu código de acesso" />
            </FormGroup>
            <Button disabled={this.state.loading} type="submit">Enviar</Button>
          </Form>
        </Container>
      )      
    );
  }
}

export default App;
