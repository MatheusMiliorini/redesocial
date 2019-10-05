import React, { Component } from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
import { Usuario } from './Usuario';

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

function Busca(props) {
    return (
        <React.Fragment>
            <label>Buscar pessoas</label>
            <input type="text" className="form-control" onChange={props.onChange} value={props.pesquisa} />
            {/* <small className="form-text text-muted">Apenas usuários com seus idiomas serão listados.</small> */}
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