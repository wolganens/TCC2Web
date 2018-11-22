import React from 'react';
import { withRouter } from 'react-router-dom';
import { Alert } from 'reactstrap';

export default withRouter(class Auth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenError: '',
      loading: false,
    }
  }
  componentWillMount() {
    if (!this.props.match.params.hasOwnProperty('token')) {
      return alert('Insira o token de acesso na URL');
    }

    const token = this.props.match.params.token;
    return fetch('/researchers/profile_by_token/' + token, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(res => res.json())
    .then(profile => {
      if (!profile) {
        return alert('O código de acesso inserido é inválido!');        
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(profile));
      this.props.setUser(profile)
      this.setState((prevState, props) => {
        return {
          loading: false
        }
      });
      this.props.history.push('/help');
    });
  }
  componentWillUnmount() {

  }
  render() {    
    if (!this.props.match.params.hasOwnProperty('token')) {
      return <Alert color="danger">Nenhuma chave de acesso foi inserida no endereço da página!</Alert>
    }
    return <div></div>
  }
});