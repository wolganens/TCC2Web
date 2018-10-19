import React, { Component } from 'react';
import Neo4jd3 from 'neo4jd3_extended';

export default class KeywordsGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
  }
  componentWillMount(){
    fetch('http://localhost:8000/researchers/keywordsgraph', {
      method: 'GET',
      headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      },
    })
    .then(res => res.json())
    .then(data => {
      return this.setState((prevState,props) => {
        return {
          data
        }
      });
    })
  }
  componentDidMount() {
    const neo4jd3 = new Neo4jd3('#graph', {
      neo4jData: this.state.data
    });
  }
  render() {
    return (<div id="graph"></div>);
  }
}