import React, { Component } from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
import styled from 'styled-components';

class Conexoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pesquisa: "",
            seguindo: [],
            resultados: [],
        }

        // Binds
        this.handlePesquisa = this.handlePesquisa.bind(this);
    }

    handlePesquisa(e) {
        const { value } = e.target;
        this.setState({
            pesquisa: value,
        });

        // Não pesquisa se estiver vazio
        if (value === "") {
            return false;
        }

        $.ajax({
            url: "/conexoes/buscaUsuarios",
            method: "GET",
            data: {
                pesquisa: value,
            },
            success: (resultados) => {
                this.setState({
                    resultados,
                });
            },
            error(erro) {
                disparaErro("Ocorreu um erro ao buscar os usuário... Por favor, cheque sua conexão e tente novamente");
            }
        });
    }

    render() {
        return (
            <div>
                <Busca pesquisa={this.state.pesquisa} onChange={this.handlePesquisa} />
                <Resultados resultados={this.state.resultados} />

                {this.state.pesquisa === "" &&
                    <Seguindo />
                }
            </div>
        )
    }
}

function Resultados(props) {
    return props.resultados.map((res, i) => <Resultado key={i} res={res} />);
}

function Resultado(props) {
    const { res } = props;
    const idiomas = JSON.parse(res.idiomas);
    const interesses = JSON.parse(res.interesses);

    const Wrapper = styled.div`
        border-bottom: 1px solid white;
        display: flex;
        flex-wrap: wrap;
        margin-top: 1rem;
        padding-bottom: 1rem;
    `

    const Avatar = styled.img`
        height: 3rem;
        width: 3rem;
        border-radius: 50%;
    `

    const Nome = styled.p`
        color: white;
        margin: 0 10px;
        display: inline-block;
    `

    const Localizacao = styled.p`
        color: white;
        margin: 0;
        display: inline-block;
    `

    return (
        <Wrapper>
            <Avatar src={res.foto} />
            <Nome>{res.nome}</Nome>
            <Localizacao>{res.localizacao}</Localizacao>
        </Wrapper>
    );
}

function Busca(props) {
    return (
        <React.Fragment>
            <label>Buscar pessoas</label>
            <input type="text" className="form-control" onChange={props.onChange} value={props.pesquisa} />
            <small className="form-text text-muted">Apenas usuários com seus idiomas serão listados.</small>
        </React.Fragment>
    )
}

function Seguindo(props) {
    return (
        <React.Fragment>
            <h4 className="rem1top">Seguindo</h4>
        </React.Fragment>
    )
}

ReactDom.render(
    <Conexoes />,
    document.getElementById("conexoes")
)