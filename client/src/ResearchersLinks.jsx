import React from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';

export default class Example extends React.Component {
  render() {
    const {researchers, onClick, filter} = this.props;
    return (
      <ListGroup style={{maxHeight: '100vh', overflowY: 'scroll'}}>
        {
          filter.trim() && filter.length > 3 ? researchers.filter(r => r.name.match(filter)).map( researcher => (
            <ListGroupItem key={researcher.id} onClick={ () => onClick(researcher.id)}>{researcher.name}</ListGroupItem>
          )) :
          researchers.map( researcher  => (
            <ListGroupItem key={researcher.id} onClick={ () => onClick(researcher.id)}>{researcher.name}</ListGroupItem>
          ))
        }
      </ListGroup>
    );
  }
}