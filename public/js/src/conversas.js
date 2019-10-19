import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { Wrapper, Avatar, P } from './components';
import { Botao } from './Publicacao';
import PubSub from 'pubsub-js';
import styled from 'styled-components';
import moment from 'moment';

class Conversas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            conversa: null,
            conversas: [],
            mensagens: [],
            nomeAnexo: null,
            anexoAdicionado: false,
            txtMensagem: "",
            enviandoMensagem: false,
            intervalo: null,
        }

        // Binds
        this.atualizaConversas = this.atualizaConversas.bind(this);
        this.abrirConversa = this.abrirConversa.bind(this);
        this.voltar = this.voltar.bind(this);
        this.handleAnexo = this.handleAnexo.bind(this);
        this.handleMensagem = this.handleMensagem.bind(this);
        this.enviaMensagem = this.enviaMensagem.bind(this);
        this.getMensagens = this.getMensagens.bind(this);
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
            this.getMensagens();

            this.state.intervalo = setInterval(() => {
                this.getMensagens();
            }, 2000);
        });
    }

    handleAnexo(e) {
        this.setState({
            anexoAdicionado: e.target.files.length > 0,
            nomeAnexo: e.target.files[0] ? e.target.files[0].name : null,
        });
    }

    handleMensagem(e) {
        this.setState({
            txtMensagem: e.target.value
        });
    }

    /**
     * Busca as mensagens da conversa ativa
     */
    getMensagens() {
        $.ajax({
            url: `/conversas/mensagens/${this.state.conversa.conversa_id}`,
            success: (mensagens) => {
                // Caso o retorno do Ajax seja após sair de uma conversa
                if (this.state.conversa) {
                    this.setState({
                        mensagens,
                    });
                }
            },
            error: (data) => {
                if (data.responseJSON.erro) {
                    disparaErro(data.responseJSON.erro);
                } else {
                    disparaErro("Ocorreu um erro ao buscar as mensagens. Por favor, cheque sua conexão e tente novamente.");
                }
            }
        });
    }

    enviaMensagem() {
        this.setState({
            enviandoMensagem: true,
        });

        const formData = new FormData();
        formData.append("conversa_id", this.state.conversa.conversa_id);
        formData.append("mensagem", this.state.txtMensagem);
        if (this.state.anexoAdicionado) {
            formData.append("anexo", document.getElementById("anexo").files[0]);
            // formData.append("nomeAnexo", this.state.nomeAnexo); Não serve de nada
        }

        $.ajax({
            url: "/conversas/mensagens",
            method: "POST",
            contentType: false,
            processData: false,
            data: formData,
            headers: headerAjax,
            success: () => {
                this.setState({
                    anexoAdicionado: false,
                    nomeAnexo: null,
                    txtMensagem: "",
                    enviandoMensagem: false,
                });

                this.getMensagens();
            },
            error: (data) => {
                if (data.responseJSON.erro) {
                    disparaErro(data.responseJSON.erro);
                } else {
                    disparaErro("Ocorreu um erro ao enviar a mensagem. Por favor, cheque sua conexão e tente novamente.");
                }

                this.setState({
                    enviandoMensagem: false,
                });
            }
        });
    }

    voltar() {
        clearInterval(this.state.intervalo);
        this.setState({
            conversa: null,
            intervalo: null,
            mensagens: [],
        });
    }

    render() {

        const DivMensagens = styled.div`
            flex: 1 1 0%;
            padding-right: 0.5rem;
            margin: 1rem 0px;
            /* max-height: calc(100% - 71px - 1rem);
            overflow-y: auto; */
        `;

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
                    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                        <div style={{ paddingBottom: "0.5rem", width: "100%", borderBottom: "solid 1px white" }}> {/** HEADER */}
                            <Avatar src={this.state.conversa.foto} style={{ height: "32px", width: "32px" }} />
                            <P>{this.state.conversa.usuario}</P>
                            <button
                                onClick={this.voltar}
                                className="btn btn-sm btn-info" style={{ float: "right" }}>
                                Voltar
                            </button>
                        </div>
                        <DivMensagens> {/** Mensagens */}
                            {this.state.mensagens.map((msg, i) => <Mensagem key={i} mensagem={msg} />)}
                        </DivMensagens>
                        <div style={{ display: "flex", alignItems: "flex-end", width: "100%", paddingBottom: "0.5rem" }}>
                            <input
                                style={{ flex: "0.90", marginRight: "0.5rem" }}
                                type="text"
                                value={this.state.txtMensagem}
                                onChange={this.handleMensagem}
                                className="form-control"
                                placeholder="Escreva uma mensagem" />
                            <input
                                onChange={this.handleAnexo}
                                type="file" id="anexo"
                                style={{ display: "none" }} />
                            <button
                                onClick={() => $("#anexo").click()}
                                title={this.state.nomeAnexo ? this.state.nomeAnexo : "Anexar algo"}
                                style={{ flex: "0.05", marginRight: "0.5rem", border: "1px solid #2E4052" }}
                                className="btn">
                                <i style={{ color: this.state.anexoAdicionado ? "var(--azul-bonito)" : "var(--mostarda)" }} className="fas fa-paperclip" />
                            </button>
                            <button
                                disabled={(!this.state.anexoAdicionado && this.state.txtMensagem.length === 0) || this.state.enviandoMensagem}
                                title="Enviar mensagem"
                                onClick={this.enviaMensagem}
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

function Mensagem({ mensagem }) {
    const WrapperMensagem = styled.div`
        background-color: #373a3e;
        color: white;
        padding: 0.1rem 0.5rem;
        display: table;
        border-radius: 5px;
        margin-bottom: 0.5rem;
        /* box-shadow: 1px 1px 1px 0px black; */
    `;

    const Divisor = styled.hr`
        margin: 0.1rem 0
    `;

    function traduzir() {
        $.ajax({
            url: "/traduzir",
            method: "POST",
            headers: headerAjax,
            data: {
                texto: mensagem.correcao != null ? mensagem.correcao : mensagem.conteudo,
            },
            success: (traducao) => {
                if (traducao.text) {
                    swal({
                        icon: "info",
                        text: `Traduzido de ${traducao.source}: ${traducao.text}`,
                        buttons: {
                            confirm: {
                                visible: true,
                                closeModal: true,
                                text: "OK"
                            }
                        }
                    })
                } else {
                    disparaErro("Ocorreu um erro ao traduzir o texto. Por favor, cheque sua conexão e tente novamente.");
                }
            },
            error: (data) => {
                if (data.responseJSON.erro) {
                    disparaErro(data.responseJSON.erro);
                } else {
                    disparaErro("Ocorreu um erro ao traduzir o texto. Por favor, cheque sua conexão e tente novamente.");
                }
            }
        });
    }

    function corrigir() {
        let input = document.createElement("input");
        input.value = mensagem.correcao ? mensagem.correcao : mensagem.conteudo;
        input.classList = "form-control";
        input.id = "swalInput";

        swal({
            title: "Corrigir Mensagem",
            text: "Insira a baixo a mensagem correta",
            content: input,
            buttons: {
                cancel: {
                    visible: true,
                    closeModal: true,
                    text: "Cancelar",
                },
                confirm: {
                    visible: true,
                    closeModal: false,
                }
            }
        }).then(val => {
            if (!val) {
                swal.close();
                return;
            }

            let correcao = $("#swalInput").val();
            if (correcao == "") {
                swal.close();
                return;
            }

            $.ajax({
                url: "/conversas/correcoes",
                method: "POST",
                headers: headerAjax,
                data: {
                    conversa_id: mensagem.conversa_id,
                    mensagem_id: mensagem.mensagem_id,
                    correcao,
                },
                success: (data) => {
                    swal({
                        title: "Sucesso!",
                        text: "Mensagem corrigida com sucesso!",
                        icon: "success",
                        timer: 2000,
                    });
                },
                error: (data) => {
                    if (data.responseJSON.erro) {
                        disparaErro(data.responseJSON.erro);
                    } else {
                        disparaErro("Ocorreu um erro ao corrigir a mensagem. Por favor, cheque sua conexão e tente novamente.");
                    }
                }
            });
        })
    }

    return (
        <WrapperMensagem style={mensagem.minhaMensagem ? { marginLeft: "auto", textAlign: "right" } : {}}>
            <small>{mensagem.minhaMensagem ? "Você" : mensagem.nome} | {moment(mensagem.quando).fromNow(true)}</small>
            <Divisor />
            <span style={mensagem.correcao != null ? { color: "red" } : {}}>{mensagem.conteudo}</span>
            {mensagem.correcao != null &&
                <>
                    <br />
                    <span style={{ color: "green" }}>{mensagem.correcao}</span>
                    <br />
                    <small>Corrigido por: {mensagem.quem_corrigiu}</small>
                </>
            }
            {(mensagem.link && mensagem.tipo_link.includes("image")) &&
                <div style={{ textAlign: "center" }}>
                    <img src={mensagem.link}
                        style={{ maxWidth: "100%", maxHeight: "200px" }} />
                </div>
            }
            {(mensagem.link && mensagem.tipo_link.includes("video")) &&
                <div style={{ textAlign: "center" }}>
                    <video
                        controls
                        style={{ maxWidth: "100%", maxHeight: "200px" }}>
                        <source src={mensagem.link} type={mensagem.tipo_link} />
                    </video>
                </div>
            }
            <Divisor />
            {mensagem.conteudo != null &&
                <div style={{ textAlign: "left", margin: "0.5rem 0" }}>
                    <button
                        style={{ border: "1px solid white", marginRight: "0.5rem", color: "var(--mostarda)", backgroundColor: "var(--dark)" }}
                        className="btn"
                        title="Traduzir"
                        onClick={traduzir}>
                        <i className="fas fa-language" />
                    </button>
                    <button
                        style={{ border: "1px solid white", color: "var(--mostarda)", backgroundColor: "var(--dark)" }}
                        className="btn"
                        title="Corrigir"
                        onClick={corrigir}>
                        <i className="fas fa-check" />
                    </button>
                </div>
            }
        </WrapperMensagem>
    )
}

moment.locale('pt-br');

ReactDom.render(
    <Conversas />,
    document.getElementById("conversas")
)

ReactDom.render(
    <ListaUsuarios />,
    document.getElementById("corpoModal")
)