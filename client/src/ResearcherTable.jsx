import React from 'react';
import { Table } from 'reactstrap';


export default class ResearcherTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sort: 'bc'
    }
    this.handleSort = this.handleSort.bind(this);
  }
  handleSort(sort) {    
    this.setState({
      sort
    })
  }  
  render() {
    const {researcher} = this.props;    
    return (
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Campus</th>
            <th onClick={() => this.handleSort('bc')}>Bibliographic Coupling</th>
            <th onClick={() => this.handleSort('cs')}>Cosine Similarity</th>
          </tr>
        </thead>
        <tbody>
        {
          researcher.related.sort((a,b) => {
            console.log(a)
            console.log(a['RelatedResearcher'][this.state.sort])
            if (a[this.state.sort] < b['RelatedResearcher'][this.state.sort]) {
              return -1;
            }
            else if (a['RelatedResearcher'][this.state.sort] > b['RelatedResearcher'][this.state.sort]) {
              return -1;
            } else {
              return 0;
            }
          }).map(r => (
            <tr>
              <th scope="row">{r.id}</th>
              <td>{r.name}</td>
              <td>{r.campus.campus}</td>
              <td>{r.RelatedResearcher.bc}</td>
              <td>{r.RelatedResearcher.cs}</td>
            </tr>
          ))
        }
        </tbody>
      </Table>
    );
  }
}