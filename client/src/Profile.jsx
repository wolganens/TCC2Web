import React from 'react';
import { 
  Row,
  Col,
} from 'reactstrap';

export default class Profile extends React.Component {
  render() {
    const {profile} = this.props;
    if (!profile) {
      return <h1>Selecione um pesquisador</h1>
    }    
    return (
      profile && (
        <div>
          <h1>{profile.name}</h1>
          <Row>
            {profile.projects.map(p => (
              <Col key={p.id} xs={6}>
                <p><strong>Código SIPPEE: {p.sippee_id}</strong></p>
                <p>Palavras-chave</p>
                <ul>
                  { p.keywords.map(keyword => (
                    <li key={keyword.id}>{keyword.keyword}</li>
                  ))}
                </ul>
                <p>Referências</p>
                <ul>
                  { p.references.map(reference => (
                    <li key={reference.id}>{reference.reference}</li>
                  ))}
                </ul>
              </Col>
            ))}
          </Row>
        </div>
      )
    );
  }
}