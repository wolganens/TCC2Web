import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';

export default class Help extends React.Component {
  render() {
    return (
      <Container>
        <h1>Bem-vindo(a) <span class="cap">{this.props.user.name}</span></h1>
        <p>
          Você foi convidado para participar do processo de avaliação de um <strong>Sistema de Recomendação</strong> que visa 
          recomendar pesquisadores com potencial de colaboração na UNIPAMPA. A recomendação é feita com base na similaridade
           do conteúdo de projetos de pesquisa extraídos da plataforma SIPPEE. Este, é um trabalho de conclusão de curso do discente
           Wolgan Ens Quepfert do curso de Ciência da Computação sob orientação da docente Andréa Sabedra Bordin. Nesta página encontram-se detalhes sobre a 
           utilização do sistema e sobre o processo de avaliação.
        </p>
        <Row>
          <Col xs={6}>
            <h2>Navegação</h2>
            No menu superior de navegação as seguintes páginas estão disponíveis:
            <ul>
              <li>
                <strong> Minhas Recomendações: </strong>
                Nesta página, você tem acesso a um grafo dos pesquisadores que foram recomendados para você. Pesquisadores 
                com os quais você já colaborou no passado aparecem com o rótulo "Coautor" sobre o vértice que o representa. Abaixo de cada 
                vértice há um valor percentual indicando a força da recomendação.
              </li>
              <li>
                <strong>Grafo de Recomendações: </strong>
                Nesta página, você tem acesso a uma visão geral da rede de recomendações feitas pelo sistema de recomendação 
                desenvolvido. Esta rede é representada por um grafo, onde os vértices (círculos) representam pesquisadores e 
                as arestas (linhas) representam as recomendações feitas. A espessura da linha da aresta representa a força da 
                recomendação e linhas vermelhas representam relações de coautoria, ou seja, indica que os pesquisadores envolvidos
                na relação, já colaboraram em algum trabalho anterior.
              </li>
            </ul>
          </Col>
          <Col xs={6}>
            <h2>Avaliação das Recomendações</h2>
            Neste processo, convidamos você a avaliar as recomendações que o sistema realizou. Você realizará uma avaliação 
            das recomendações feitas do ponto de vista de usuário. Dessa forma, as recomendações devem ser avaliadas de acordo com determinados
            aspectos. Os aspectos abordados neste objeto de avaliação são os apresentados em   
            <a href="https://dl.acm.org/citation.cfm?id=2043962" target="_blank"> Pu, Chen e Hu (2011)</a>, onde os autores 
            levantam pontos que devem ser levados em consideração quando se avalia um sistema de recomendação do ponto de vista do usuário: 
            <ul>
              <li>
                <strong>Precisão percebida: </strong> Os pesquisadores recomendados são de meu interesse.
              </li>
              <li>
                <strong>Novidade (ou descoberta): </strong> Descobri pesquisadores com potencial de colaboração que eu não conhecia anteriormente.
              </li>
              <li>
                <strong>Diversidade: </strong> Foram sugeridos diversos pesquisadores.
              </li>
              <li>
                <strong>Transparência: </strong> Consegui perceber porque os pesquisadores foram recomendados para mim.
              </li>
              <li>
                <strong>Atratividade: </strong> Fiquei entusiasmado com as novas possibilidades de colaboração.
              </li>
              <li>
                <strong>Facilidade de uso: </strong> Não encontrei dificuldades na utilização do sistema.
              </li>
              <li>
                <strong>Utilidade percebida: </strong> A tarefa de encontrar colegas para colaborar em projetos ficou mais fácil de ser executada.
              </li>
              <li>
                <strong>Intenções do usuário: </strong> Caso implantado, utilizaria o sistema frequentemente.
              </li>
            </ul>
            <p>
              A fim de avaliar o sistema de recomendação e por consequência, as recomendações geradas, foi implantado um mecanismo de avaliação 
              da lista de potenciais colaboradores gerados e do grafo da rede de recomendação. Este mecanismo foi construído no formato de
              um questionário, onde os usuários do sistema (pesquisadores participantes da pesquisa), podem indicar a relevância das recomendações 
              feitas.  Desta forma, os resultados das entrevistas serão utilizados para o aperfeiçoamento contínuo do sistema.
            </p>
            <p>
              Para acessar o formulário de avaliação, basta navegar até o link onde são exibidas as recomendações feitas para você. Ao acessar a página,
              no canto inferior esquerdo existe um botão chamado <strong>"Avaliar Recomendações".</strong> Ao clicar nesse botão, você será redirecionado para 
              o formulário onde para cada aspecto apresentado anteriormente, há uma questão equivalente. As respostas das questões são valores numéricos em um intervalo
              de 1 (“discordo completamente”) até 5 (“concordo completamente”).
            </p>
          </Col>
        </Row>        
      </Container>
    )    
  }
}