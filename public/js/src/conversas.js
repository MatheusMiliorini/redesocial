import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { Wrapper, Avatar, P } from './components';
import PubSub from 'pubsub-js';

class Conversas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            conversa: null,
            conversas: []
        }

        // Binds
        this.atualizaConversas = this.atualizaConversas.bind(this);
        this.abrirConversa = this.abrirConversa.bind(this);
        this.voltar = this.voltar.bind(this);
    }

    componentDidMount() {
        PubSub.subscribe("INICIAR_CONVERSA", (msg, usuario_id) => {
            $.ajax({
                url: "/conversas/iniciar",
                method: "POST",
                headers: headerAjax,
                data: {
                    usuario_id
                },
                success: () => {
                    jQuery("#modalUsuarios").modal('hide');
                    this.atualizaConversas();
                },
                error: (data) => {
                    let erro = "Ocorreu um erro ao iniciar a conversa. Por favor, verifique sua conexão e tente novamente.";
                    if (data.responseJSON && data.responseJSON.erro) {
                        erro = data.responseJSON.erro;
                    }
                    disparaErro(erro);
                }
            });
        });

        this.atualizaConversas();
    }

    atualizaConversas() {
        $.ajax({
            url: "/conversas/lista",
            success: (conversas) => {
                this.setState({
                    conversas
                });
            },
            error: (data) => {
                disparaErro("Ocorreu um erro ao buscar as conversas. Por favor, verifique sua conexão e tente novamente.");
            }
        })
    }

    abreModalUsuarios() {
        jQuery("#modalUsuarios").modal('show');
    }

    abrirConversa(conversa) {
        this.setState({
            conversa
        }, () => {
            // Busca as mensagens da conversa
        })
    }

    voltar() {
        this.setState({
            conversa: null
        });
    }

    render() {
        return (
            <>
                {!this.state.conversa && // SÓ APARECE SEM CONVERSA SELECIONADA
                    <>
                        <h3 style={{ color: "white", marginTop: "1rem" }}>Minhas Conversas:</h3>
                        {this.state.conversas.length === 0 &&
                            <div style={{ textAlign: "center" }}>
                                <h5 style={{ color: "white", fontStyle: "italic" }}>Nada aqui ainda :(</h5>
                            </div>
                        }
                        {this.state.conversas.map((conv, i) => <Conversa key={i} conversa={conv} onClick={this.abrirConversa} />)}
                        <button
                            onClick={this.abreModalUsuarios}
                            className="btn btn-sm btn-primary"
                            style={{ float: "right" }}>Nova Conversa</button>
                    </>
                }
                {this.state.conversa && // APARECE QUANDO SELECIONA UMA CONVERSA
                    <div style={{ height: "100%", display: "flex", flexWrap: "wrap" }}>
                        <div style={{ height: "calc(32px + 0.5rem)", width: "100%", borderBottom: "solid 1px white" }}> {/** HEADER */}
                            <Avatar src={this.state.conversa.foto} style={{ height: "32px", width: "32px" }} />
                            <P>{this.state.conversa.usuario}</P>
                            <button
                                onClick={this.voltar}
                                className="btn btn-sm btn-info" style={{ float: "right" }}>
                                Voltar
                            </button>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end", width: "100%", paddingBottom: "0.5rem" }}>
                            <input
                                style={{ flex: "0.90", marginRight: "0.5rem" }}
                                type="text"
                                className="form-control"
                                placeholder="Escreva uma mensagem" />
                            <button
                                title="Anexar algo"
                                style={{ flex: "0.05", marginRight: "0.5rem", border: "1px solid #2E4052" }}
                                className="btn">
                                <i style={{ color: "var(--mostarda)" }} className="fas fa-paperclip" />
                            </button>
                            <button
                                title="Enviar mensagem"
                                style={{ flex: "0.05", border: "1px solid #2E4052" }}
                                className="btn">
                                <i style={{ color: "var(--mostarda)" }} className="far fa-paper-plane" />
                            </button>
                        </div>
                    </div>
                }
            </>
        )
    }
}

class ListaUsuarios extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usuarios: [],
        }
    }

    componentDidMount() {
        $.ajax({
            url: "/conexoes/seguindo",
            success: (usuarios) => {
                this.setState({
                    usuarios
                });
            },
            error() {
                disparaErro("Ocorreu um erro ao listar o usuários. Por favor, verifique sua conexão e tente novamente.");
            }
        })
    }

    render() {
        return this.state.usuarios.map((usu, i) => <Usuario usuario={usu} key={i} />);
    }
}

function Usuario(props) {
    let interesses = JSON.parse(props.usuario.interesses).join(", ");
    let idiomas = JSON.parse(props.usuario.idiomas).map(idi => idi.idioma);
    idiomas = idiomas.join(", ");

    function iniciaConversa() {
        PubSub.publish("INICIAR_CONVERSA", props.usuario.usuario_id)
    }

    return (
        <Wrapper>
            <Avatar
                src={props.usuario.foto}
            />
            <P>{props.usuario.nome}</P>
            <button
                className="btn btn-sm btn-primary"
                style={{ float: "right" }}
                onClick={iniciaConversa}
            >
                Iniciar Conversa
            </button>

            <P style={{ fontSize: "0.8rem", display: "block" }}>Idiomas: {idiomas}</P>
            <P style={{ fontSize: "0.8rem", display: "block" }}>Interesses: {interesses}</P>
        </Wrapper>
    )
}

function Conversa(props) {
    return (
        <Wrapper style={{ marginBottom: "1rem" }}>
            <Avatar src={props.conversa.foto} />
            <P>{props.conversa.usuario}</P>
            <button
                onClick={() => props.onClick(props.conversa)}
                style={{ float: "right" }}
                className="btn btn-sm btn-primary">
                Abrir
            </button>
        </Wrapper>
    )
}

ReactDom.render(
    <Conversas />,
    document.getElementById("conversas")
)

ReactDom.render(
    <ListaUsuarios />,
    document.getElementById("corpoModal")
)