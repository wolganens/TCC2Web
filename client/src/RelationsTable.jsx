import React from 'react';
import { 
  FormGroup,
  Input,
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
} from 'reactstrap';

export default class RelationsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      relations: [],
      researcherInputValue: '',
      page: 0,
      rowsPerPage: 50,
    }
    this.handleSort = this.handleSort.bind(this);
    this.handleResearchInputChange = this.handleResearchInputChange.bind(this);
    this.createPagination = this.createPagination.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.nameFiltered = this.nameFiltered.bind(this);
  }
  handleResearchInputChange(event) {
    const { value: researcherInputValue } = event.target;
    this.setState((prevState, props) => {
      return {
        researcherInputValue,
        page: 0
      };
    })    
  }
  /**
  * Find and highlight relevant keywords within a block of text
  * @param  {string} label - The text to parse
  * @param  {string} value - The search keyword to highlight
  * @return {object} A JSX object containing an array of alternating strings and JSX
  */
  formatLabel(label, value){
    if (!value || value.length < 8) {
      return label;
    }
    return (
      <span>
        { label.split(value)
          .reduce((prev, current, i) => {
            if (!i) {
              return [current];
            }
            return prev.concat(<b key={value + current}>{ value }</b>, current);
          }, [])
        }
      </span>
    );
  };
  handleChangePage(e) {
    e.preventDefault();
    const page = parseInt(e.target.textContent, 10) - 1;
    this.setState((prevState, props) => {
      return { 
        page,
        researcherInputValue: ''
      }
    });    
  }
  createPagination() {
    const items = [];
    let page = 1;
    for (page = 0 ; page <= this.state.page + 5 ; page++) {
      if (page < this.props.relations.length) {
        items.push(
          <PaginationItem disabled={page === this.state.page}>
            <PaginationLink onClick={this.handleChangePage} href="#">
             { page + 1 }
            </PaginationLink>
          </PaginationItem>
        )
      }
    }
    return items;
  }
  nameFiltered(relations) {
    return relations.filter(r => {
      if(this.state.researcherInputValue.trim() && this.state.researcherInputValue.length > 3) {
        return (r.a_name.match(this.state.researcherInputValue) || r.b_name.match(this.state.researcherInputValue));
      } else {
        return true;
      }
    });
  }
  handleSort(sort) {
    this.setState((state, props) => {
      return {        
        sort: sort,
        order: state.sort === sort ? -1 * state.order : 1
      };
    });
  }
  render() {
    const {relations} = this.props;
    const {page, rowsPerPage} = this.state;
    return (
      <div>
        <FormGroup>
          <Input 
            type="text" 
            value={this.state.researcherInputValue} 
            name="researcher" 
            placeholder="Filtrar pesquisadores" 
            onChange={this.handleResearchInputChange}
          />
        </FormGroup>
        <Pagination aria-label="Page navigation example">
          <PaginationItem>
            <PaginationLink previous href="#" />
          </PaginationItem>
            {this.createPagination()}
          <PaginationItem>
            <PaginationLink next href="#" />
          </PaginationItem>
        </Pagination>
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>P1</th>
              <th>P2</th>
              <th onClick={() => this.handleSort('bc')}>BC</th>
              <th onClick={() => this.handleSort('cs')}>CS</th>
            </tr>
          </thead>
          <tbody>
          {
            this.nameFiltered(relations).sort((a,b)=>{
              if (a[this.state.sort] < b[this.state.sort]) {
                return this.state.order;
              } else if (a[this.state.sort] > b[this.state.sort]) {
                return -1 * this.state.order;
              } else {
                return 0;
              }
            }).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map(r => (
              <tr>
                <th scope="row">{r.id}</th>
                <td>{this.formatLabel(r.a_name, this.state.researcherInputValue)} - {r.a_campus}</td>
                <td>{this.formatLabel(r.b_name, this.state.researcherInputValue)} - {r.b_campus}</td>
                <td>{r.bc}</td>
                <td>{r.cs}</td>
              </tr>
            ))
          }
          </tbody>
        </Table>
      </div>
    );
  }
}