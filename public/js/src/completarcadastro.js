import React, { Component } from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
import PubSub from 'pubsub-js';

class SeletorIdiomas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            qtdIdiomas: 1,
            idiomas: [],
            idiomasSelecionados: [{
                idioma_id: 5,
                nivel_conhecimento: 1,
            }],
        };

        // Bindings
        this.addIdioma = this.addIdioma.bind(this);
    }

    componentDidMount() {
        // Busca os idiomas e suas respectivas bandeiras
        $.ajax({
            url: "/idiomas",
            method: "GET",
            success: (idiomas) => {
                this.setState({
                    idiomas
                })
            },
            error: (data) => {
                swal({
                    title: "Oops...",
                    icon: "error",
                    text: "Ocorreu um erro ao carregar os idiomas. Por favor, tente novamente",
                })
            }
        });

        // Busca os idiomas selecionados do usuário logado (tela meuPerfil)
        $.ajax({
            url: "/meuPerfil/idiomas",
            success: (idiomas) => {
                if (idiomas.length > 0) {
                    this.setState({
                        qtdIdiomas: 0,
                        idiomasSelecionados: []
                    });

                    this.setState({
                        qtdIdiomas: idiomas.length,
                        idiomasSelecionados: idiomas,
                    });
                }
            },
            error: (data) => {
                if (data.responseJSON.erro) {
                    disparaErro(data.responseJSON.erro);
                } else {
                    disparaErro("Ocorreu um erro ao buscar seus níveis de idiomas. Por favor, cheque sua conexão e tente novamente.");
                }
            }
        })

        PubSub.subscribe("REMOVE_LINHA", () => {
            this.setState({
                qtdIdiomas: this.state.qtdIdiomas - 1,
                idiomasSelecionados: this.state.idiomasSelecionados.filter((val, i) => i != this.state.idiomasSelecionados.length - 1)
            })
        })
    }

    addIdioma() {
        this.setState({
            qtdIdiomas: this.state.qtdIdiomas + 1,
            idiomasSelecionados: this.state.idiomasSelecionados.concat({ idioma_id: 5, nivel_conhecimento: 1 })
        })
    }

    render() {

        let linhas = [];
        for (let i = 0; i < this.state.qtdIdiomas; i++) {
            linhas.push(<LinhaSelect
                key={i}
                ultimo={i + 1 == this.state.qtdIdiomas}
                selecionado1={this.state.idiomasSelecionados[i].idioma_id}
                selecionado2={this.state.idiomasSelecionados[i].nivel_conhecimento}
                idiomas={this.state.idiomas} />);
        }

        return (
            <div>
                {linhas}
                <button type="button" className="btn btn-info" style={{ marginTop: "5px" }} onClick={this.addIdioma}>Adicionar idioma</button>
            </div>
        )
    }
}

function LinhaSelect(props) {

    let niveis = [];
    for (let i = 1; i <= 5; i++) {
        niveis.push(<option key={i} value={i}>{i}</option>);
    }

    function removeLinha() {
        PubSub.publish("REMOVE_LINHA");
    }

    return (
        <div className="form-group" style={{ marginTop: "5px", display: "flex", alignItems: "flex-end" }}>
            <div style={{ flex: 0.5 }}>
                <label>Idioma</label>
                <select className="form-control" name="idioma_id[]" defaultValue={props.selecionado1} >
                    {props.idiomas.map((idioma, i) => <option key={i} value={idioma.idioma_id}>{idioma.nome}</option>)}
                </select>
            </div>
            <div style={{ flex: 0.5, paddingLeft: "15px" }}>
                <label>Nível de conhecimento</label>
                <select className="form-control" name="nivel_conhecimento[]" defaultValue={props.selecionado2}>
                    {niveis}
                </select>
            </div>
            {props.ultimo &&
                <div style={{ paddingLeft: "15px" }}>
                    <label style={{ minHeight: '1rem' }}></label>
                    <button type="button" style={{ color: "red", border: '1px solid var(--mostarda)' }} onClick={removeLinha} className="btn" title="Clique para remover"><i className="far fa-trash-alt"></i></button>
                </div>
            }
        </div>
    )
}

ReactDom.render(
    <SeletorIdiomas />,
    document.getElementById("seletorIdiomas")
)