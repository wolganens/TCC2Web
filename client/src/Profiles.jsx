import React from 'react';
import ResearchersLinks from './ResearchersLinks.jsx';
import Profile from './Profile.jsx';
import { Col, Row } from 'reactstrap';

export default class Profiles extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      researchers:[],
      selected: null,
      filter: '',
      profile: null
    }
    this.fetchedProfiles = {};
    this.setSelected = this.setSelected.bind(this);
    this.getResearcherProfile = this.getResearcherProfile.bind(this);
	}
	componentWillMount() {
    if (this.props.match.params.name) {
      this.getResearcherProfile(this.props.match.params.name)
    }
  }
  getResearcherProfile(name) {
    if (this.fetchedProfiles.hasOwnProperty(name)) {
      return this.setState((prevState,props) => {
        return {
          profile: this.fetchedProfiles[name]
        }
      })
    } else {
      fetch('/researchers/profile/' + name, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then(res => res.json())
      .then(profile => {
        this.fetchedProfiles[name] = profile;
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
      <Profile profile={this.state.profile}/>
		)
	}
}