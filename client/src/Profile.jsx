import React from 'react';
import { 
  Row,
  Col,
  Container,
  Badge
} from 'reactstrap';

import { Progress } from 'reactstrap';

class ProgressBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { seconds: 0 };
    this.tick = this.tick.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }
  tick() {
    this.setState(state => ({
      seconds: state.seconds + 1
    }));
  }
  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 300);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    return (
      <div>
        <div className="text-center">{this.state.seconds}%</div>
        <Progress value={this.state.seconds <= 100 ? this.state.seconds : 100}/>
      </div>
    );
  }
};

export default class Profile extends React.Component {
  render() {
    const {profile} = this.props;
    if (!profile) {
      return <ProgressBar/>
    }    
    return (
      profile && (
        <div style={{maxWidth: '95%'}}>
          <h1>{profile.name.split(" ").map((r,i) => <span key={i} className={r.length > 2 ? "cap" : ''}>{r + " "}</span>)} { profile.lattes && (<a id="lattes-link" href={profile.lattes} target="_blank">(Currículo Lattes)</a>) }</h1>
          <Row>
            {profile.projects.map(p => (
              <Col key={p.id} xs="4">
                <div className="profile-project">
                  <p>
                    <strong>Projeto SIPPEE {p.sippee_id} </strong>
                    <a target="_blank" href={"https://www10.unipampa.edu.br/sippee/portal/resumo.php?projeto_id=" + p.sippee_id}>
                      Ver resumo do projeto
                    </a>
                  </p>
                  <p>Palavras-chave</p>
                  { p.keywords.map(keyword => (
                    <Badge color="secondary" key={keyword.id}>{keyword.keyword}</Badge>
                  ))}
                  <p>Referências</p>
                  <ul className="project-references">
                    { p.references.map(reference => (
                      <li key={reference.id}>{reference.reference}</li>
                    ))}
                  </ul>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )
    );
  }
}