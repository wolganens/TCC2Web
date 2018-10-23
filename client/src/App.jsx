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
  } from 'reactstrap';

import Graph from './Graph.jsx';
import Profiles from './Profiles.jsx';
import RelationsTable from './RelationsTable.jsx';
import KeywordsGraph from './KeywordsGraph.jsx';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      researchers: [],
      relations: [],
      researcher: null,
      researcherInputValue: ''
    }
    this.onResearcherClick = this.onResearcherClick.bind(this);
    this.handleResearchInputChange = this.handleResearchInputChange.bind(this);
  }
  componentWillMount() {
    fetch('http://localhost:8000/researchers/relations', {
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
  render() {
    return (
      <div>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/">TCC2</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                  <NavLink tag={Link} to="/relations">Tabela de Relações</NavLink>
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
          <Route exact path='/graph' component={Graph} />
          <Route exact path='/keywordsgraph' component={ (props) => <KeywordsGraph relation="KEYWORD_RECOMMENDED_TO"/>} />
          <Route exact path='/abcgraph' component={ (props) => <KeywordsGraph relation="BIB_RECOMMENDED_TO"/>} />
          <Route exact path='/profiles/:name?' component={Profiles} />
        </Switch>
      </div>
    );
  }
}

export default App;
