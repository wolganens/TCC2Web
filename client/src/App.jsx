import React, { Component } from 'react';
import { Link, Route, Switch } from 'react-router-dom'
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

import Graph from './Graph.jsx';
import Profiles from './Profiles.jsx';
import RelationsTable from './RelationsTable.jsx';
import KeywordsGraph from './KeywordsGraph.jsx';
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
      user: JSON.parse(localStorage.getItem('user') || null),
      tokenError: ''
    }
    this.onResearcherClick = this.onResearcherClick.bind(this);
    this.submitToken = this.submitToken.bind(this);
    this.handleResearchInputChange = this.handleResearchInputChange.bind(this);
  }
  componentWillMount() {
    if (this.state.user) {      
      const token = localStorage.getItem('token');
      if (!this.state.user) {
        
        return fetch('http://localhost:8000/researchers/profile_by_token/' + token, {
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
              loading: false
            }
          })
        })
      }
      
      fetch('http://localhost:8000/researchers/relations', {
      /*fetch('https://relatoriotcc2.herokuapp.com/researchers/relations', {*/
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then(res => res.json())
      .then(relations => {
        this.setState({
          relations,
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
    return fetch('http://localhost:8000/researchers/profile_by_token/' + token, {
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
                {/*<NavItem>
                    <NavLink tag={Link} to="/relations">Tabela de Relações</NavLink>
                </NavItem>*/}              
                <NavItem>
                    <NavLink tag={Link} to="/coauthorgraph">Coautoria</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/keywordsgraph">Grafo palavras-chave</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/abcgraph">Grafo Acoplamento Bibliográfico</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/profiles">Perfis</NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
          <Switch>
            <Route exact path='/relations' component={(props) => <RelationsTable relations={this.state.relations} />} />
            <Route exact path='/evaluation' component={ (props) => <Evaluation user={this.state.user}/>} />
            <Route exact path='/graph' component={Graph} />
            <Route exact path='/keywordsgraph' component={ (props) => <KeywordsGraph user={this.state.user} relation="KEYWORD_RECOMMENDED_TO"/>} />
            <Route exact path='/abcgraph' component={ (props) => <KeywordsGraph user={this.state.user} relation="BIB_RECOMMENDED_TO"/>} />
            <Route exact path='/coauthorgraph' component={ (props) => <KeywordsGraph user={this.state.user} relation="COAUTHORED_WITH"/>} />
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
