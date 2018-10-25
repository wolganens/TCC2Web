import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class ModalExample extends React.Component {
  constructor(props) {
    super(props);    
    this.state = {
      modal: this.props.selected !== null
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }
  getKeyWords() {
    const k = [];    
    this.props.selected.projects.forEach(p => {
      p.keywords.forEach( kw => {
        k.push(kw.keyword)
      });
    });    
    return (k.filter((value, index, self) => self.indexOf(value) === index).map((kw, i) => (
      <div key={i} className="alert-primary badge"> {kw} </div>
      )
    ))
  }
  render() {
    return (
      <div>
        <Modal id="teste-modal" isOpen={this.state.modal} toggle={this.props.toggle} className={this.props.className}>
          <ModalHeader toggle={this.props.toggle}>{this.props.selected.name}</ModalHeader>
          <ModalBody>
          <p><strong>Palavras-chave</strong></p>
          {this.getKeyWords()}
          {this.props.selected.lattes && (
            <p>
              <a target="_blank" title="Currículo lattes" href={this.props.selected.lattes}> Abrir currículo lattes</a>
            </p>
          )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.props.toggle}>Fechar</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ModalExample;
