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
            this.setState({
                resultados: [],
            });
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

class Resultado extends Component {
    constructor(props) {
        super(props);
        this.state = {
            btnHabilitado: true,
            idiomas: JSON.parse(props.res.idiomas),
            interesses: JSON.parse(props.res.interesses),
            seguindo: props.res.seguindo,
        }

        // Binds
        this.segueUsuario = this.segueUsuario.bind(this);
    }

    segueUsuario() {
        this.setState({
            btnHabilitado: false,
        });

        $.ajax({
            url: "/conexoes",
            method: "POST",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: {
                "outro": this.props.res.usuario_id,
                "seguindo": this.state.seguindo,
            },
            success: () => {
                this.setState((state) => {
                    return {
                        btnHabilitado: true,
                        seguindo: !state.seguindo
                    }
                });
            },
            error: () => {
                this.setState({
                    btnHabilitado: true,
                });
                disparaErro("Ocorreu um erro ao seguir/parar de seguir o usuário. Por favor, cheque sua conexão e tente novamente");
            }
        });
    }

    render() {
        const Wrapper = styled.div`
            border-bottom: 1px solid white;
            margin-top: 1rem;
            padding-bottom: 1rem;
            overflow: auto;
        `;

        const Avatar = styled.img`
            height: 3rem;
            width: 3rem;
            border-radius: 50%;
            float: left;
            margin-right: 1rem;
        `;

        const P = styled.p`
            color: white;
            display: inline-block;
            margin: 0;
        `;

        const P2 = styled.p`
            color: white;
            font-weight: bold;
            margin: 0;
        `;

        const BtnSeguir = styled.button`
            float: right;
        `;

        let idiomasArr = this.state.idiomas.map((idioma, i) => `${idioma.idioma} (${idioma.nivel_conhecimento})`);
        idiomasArr = <P>{idiomasArr.join(", ")}</P>;
        const interessesArr = <P>{this.state.interesses.join(", ")}</P>;

        return (
            <Wrapper>
                <Avatar src={this.props.res.foto} />
                <BtnSeguir className="btn btn-info" disabled={!this.state.btnHabilitado} onClick={this.segueUsuario}>{this.state.seguindo ? "Seguindo" : "Seguir"}</BtnSeguir>
                <P>{this.props.res.nome}</P>
                <br />
                <P>{this.props.res.localizacao}</P>
                <br />
                <P2>Idiomas:</P2>
                {idiomasArr}
                <P2>Interesses:</P2>
                {interessesArr}
            </Wrapper>
        );
    }
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