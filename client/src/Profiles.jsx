import React, { Component } from 'react';
import ResearchersLinks from './ResearchersLinks.jsx';
import Profile from './Profile.jsx';
import { 
  Col,
  Input,
  Row } from 'reactstrap';

export default class Profiles extends React.Component {
	constructor(props) {
		super(props)
    
    this.state = {
      researchers:[],
      selected: null,
      filter: '',
      profile: null
    }
    this.fetchedProfiles = {}
    this.setSelected = this.setSelected.bind(this);
    this.getResearcherProfile = this.getResearcherProfile.bind(this);
	}
	componentWillMount() {
		fetch('/researchers/researchersMenu', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(res => res.json())
    .then(researchers => 
      this.setState((prevState,props) => {
        return {
          researchers
        }
      })
    )
  }
  getResearcherProfile(id) {
    if (this.fetchedProfiles.hasOwnProperty(id)) {
      return this.setState((prevState,props) => {
        return {
          profile: this.fetchedProfiles[id]
        }
      })
    } else {
      fetch('/researchers/profile/' + id, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then(res => res.json())
      .then(profile => {
        this.fetchedProfiles[id] = profile;
        this.setState((prevState,props) => {
          return {
            profile
          }
        })        
      })
    }
  }
  setSelected(selected) {
    this.setState((prevState, props) => {
      return {
        selected
      }
    })
    this.getResearcherProfile(selected);
  }
	render() {
		return (
			<Row>
        <Col xs="3">
				  <ResearchersLinks filter={this.state.filter} onClick={this.setSelected} researchers={this.state.researchers}/>
        </Col>
        <Col xs="8">
          <Profile profile={this.state.profile}/>
        </Col>
			</Row>
		)
	}
}