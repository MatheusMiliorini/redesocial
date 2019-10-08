import React, { Component } from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
import { Usuario } from './Usuario';
import { MiniBotao, Icone, P } from '../src/components';
import styled from 'styled-components';
import update from 'immutability-helper';

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

    abrirModalDescobrir() {
        jQuery("#modalDescobrir").modal();
    }

    render() {
        return (
            <div>
                <Busca pesquisa={this.state.pesquisa} onChange={this.handlePesquisa} />
                <MiniBotao
                    className="btn"
                    style={{ float: "right", marginTop: "0.5rem" }}
                    title="Descobrir"
                    onClick={this.abrirModalDescobrir}>
                    <Icone className="fas fa-search" />
                </MiniBotao>

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

class Filtros extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idiomas: [],
            interesses: [],
        }

        // Binds
        this.mudaInteresse = this.mudaInteresse.bind(this);
        this.mudaIdioma = this.mudaIdioma.bind(this);
        this.desativaIdioma = this.desativaIdioma.bind(this);
    }

    componentDidMount() {
        // Busca os interesses do usuário
        $.ajax({
            url: "/interesses/meus",
            success: (interesses) => {
                this.setState({
                    interesses,
                });
            },
            error() {
                disparaErro("Ocorreu um erro ao buscar seus interesses. Por favor, verifique sua conexão e tente novamente.");
            }
        })
        // Busca os idiomas disponíveis
        $.ajax({
            url: "/idiomas",
            success: (idiomas) => {
                this.setState({
                    idiomas
                })
            },
            error() {
                disparaErro("Não foi possível buscar seus idiomas. Por favor, verifique sua conexão e tente novamente.");
            }
        });
    }

    mudaInteresse(indice) {
        this.setState((state) => {
            return {
                interesses: update(state.interesses, { [indice]: { marcado: { $set: !state.interesses[indice].marcado } } })
            }
        });
    }

    mudaIdioma(indice, tipo, e) {
        e.persist();

        if (tipo === 'INICIAL') {
            this.setState((state) => {
                return {
                    idiomas: update(state.idiomas, { [indice]: { nInicial: { $set: e.target.value } } })
                }
            });
        } else {
            this.setState((state) => {
                return {
                    idiomas: update(state.idiomas, { [indice]: { nFinal: { $set: e.target.value } } })
                }
            });
        }
    }

    desativaIdioma(indice) {
        this.setState(state => {
            return {
                idiomas: update(state.idiomas, { [indice]: { ativo: { $set: !state.idiomas[indice].ativo } } })
            }
        })
    }

    render() {
        const P2 = styled.p`
            color: white;
            font-weight: bold;
            margin: 0;
            display: block;
        `;

        return (
            <div>
                <P2>Interesses</P2>
                <Interesses interesses={this.state.interesses} onChange={this.mudaInteresse} />
                <P2>Idiomas</P2>
                <Idiomas idiomas={this.state.idiomas} onChange={this.mudaIdioma} onClick={this.desativaIdioma} />
                <button className="btn btn-success" style={{ width: "100%", marginTop: "0.5rem" }}>Buscar!</button>
            </div>
        )
    }
}

function Interesses(props) {
    return props.interesses.map((int, i) => <Interesse key={i} indice={i} interesse={int} onChange={props.onChange} />)
}

function Idiomas(props) {
    return props.idiomas.map((idi, i) => <Idioma key={i} indice={i} idioma={idi} onChange={props.onChange} onClick={props.onClick} />);
}

function Interesse(props) {
    return (
        <div className="custom-control custom-checkbox">
            <input
                type="checkbox"
                className="custom-control-input"
                id={props.indice}
                checked={props.interesse.marcado}
                onChange={() => props.onChange(props.indice)} />
            <label className="custom-control-label" htmlFor={props.indice}>{props.interesse.nome}</label>
        </div>
    )
}

function Idioma(props) {
    return (
        <div className="row">
            <div className="col-6">
                <label>Idioma</label>
                <input
                    title="Clique para desabilitar o idioma"
                    type="text"
                    className="form-control"
                    value={props.idioma.nome}
                    onClick={() => props.onClick(props.indice)}
                    readOnly={!props.idioma.ativo} />
            </div>
            <div className="col-3" title="Nível de conhecimento mínimo">
                <label>Mínimo</label>
                <select className="form-control" value={props.idioma.nInicial} onChange={(e) => props.onChange(props.indice, 'INICIAL', e)}>
                    {[1, 2, 3, 4, 5].map(i => <option key={i}>{i}</option>)}
                </select>
            </div>
            <div className="col-3" title="Nível de conhecimento máximo">
                <label>Máximo</label>
                <select className="form-control" value={props.idioma.nFinal} onChange={(e) => props.onChange(props.indice, 'FINAL', e)}>
                    {[5, 4, 3, 2, 1].map(i => <option key={i}>{i}</option>)}
                </select>
            </div>
        </div>
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

ReactDom.render(
    <Filtros />,
    document.getElementById("corpoModal")
)