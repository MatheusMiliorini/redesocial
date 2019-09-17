import React, { Component } from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
import styled from 'styled-components';
import { Wrapper, Avatar, P } from './components';

class Conexoes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pesquisa: "",
            seguindo: [],
            seguidores: [],
            resultados: [],
        }

        // Binds
        this.handlePesquisa = this.handlePesquisa.bind(this);
        this.buscaSeguindo = this.buscaSeguindo.bind(this);
        this.buscaSeguidores = this.buscaSeguidores.bind(this);
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

            // Atualiza a lista de seguindo
            this.buscaSeguindo();

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

    /**
     * Faz as buscas iniciais
     */
    componentDidMount() {
        this.buscaSeguindo();
        this.buscaSeguidores();
    }

    /**
     * Busca os usuários que eu sigo
     */
    buscaSeguindo() {
        $.ajax({
            url: "/conexoes/seguindo",
            method: "GET",
            success: (seguindo) => {
                this.setState({
                    seguindo,
                })
            },
            error() {
                disparaErro("Ocorreu um erro ao buscar os usuários que você segue. Por favor, verifique sua conexão e tente novamente.");
            }
        });
    }

    /**
     * Busca os usuários que me seguem
     */
    buscaSeguidores() {
        $.ajax({
            url: "/conexoes/seguidores",
            method: "GET",
            success: (seguidores) => {
                this.setState({
                    seguidores,
                })
            },
            error() {
                disparaErro("Ocorreu um erro ao buscar os usuários que seguem você. Por favor, verifique sua conexão e tente novamente.");
            }
        });
    }

    render() {
        return (
            <div>
                <Busca pesquisa={this.state.pesquisa} onChange={this.handlePesquisa} />
                {this.state.pesquisa !== "" &&
                    <Usuarios usuarios={this.state.resultados} />
                }

                {this.state.pesquisa === "" &&
                    <Bloco title="Seguindo" usuarios={this.state.seguindo} />
                }

                {this.state.pesquisa === "" &&
                    <Bloco title="Seguidores" usuarios={this.state.seguidores} />
                }
            </div>
        )
    }
}

function Usuarios(props) {
    return props.usuarios.map((res, i) => <Usuario key={i} res={res} />);
}

class Usuario extends Component {
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

/**
 * Não consegui pensar num nome melhor
 * @param {*} props 
 */
function Bloco(props) {
    return (
        <React.Fragment>
            <h4 className="rem1top">{props.title} ({props.usuarios.length})</h4>
            {props.usuarios.map((usuario, i) => <Usuario key={i} res={usuario} />)}
        </React.Fragment>
    )
}

ReactDom.render(
    <Conexoes />,
    document.getElementById("conexoes")
)