import React from 'react';

export default class EvaluationForm extends React.Component{	
	render() {
		const { user } = this.props;
		return <iframe 
			title="Formulário de avaliação do Sistema de Recomendação"
			src={`https://docs.google.com/forms/d/e/1FAIpQLSe0RFdiCQtQaT3Ms1kPjSV-w-LFyl_zf_McXp7B6C-sZzkAUA/viewform?usp=pp_url&entry.1795179999=${user.name}&entry.2140263867=${user.campus.campus}`}
			width="100%" 
			height="100%" 
			frameborder="0" 
			marginheight="0" 
			marginwidth="0">Carregando…</iframe>
	}
}
