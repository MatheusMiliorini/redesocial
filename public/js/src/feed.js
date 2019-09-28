import React, { Component } from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
import styled from 'styled-components';
import { Wrapper, Avatar, P, Icone, MiniBotao, BlocoPublicacao } from '../src/components';
import moment from 'moment';
import PubSub from 'pubsub-js';

class Feed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            publicacoes: [],
        }

        // Binds
        this.atualizaFeed = this.atualizaFeed.bind(this);
    }

    componentDidMount() {
        // Busca as publicações
        this.atualizaFeed();

        PubSub.subscribe("ATUALIZAR_FEED", () => {
            this.atualizaFeed();
        });
    }

    atualizaFeed() {
        $.ajax({
            url: "/feed/publicacoes",
            method: "GET",
            success: (data) => {
                // Limpa as publicações
                this.setState({
                    publicacoes: [],
                });
                // Recria com o retornado do servidor
                this.setState({
                    publicacoes: data,
                });
            },
            error: (data) => {
                disparaErro("Ocorreu um erro ao buscar as publicações. Por favor, verifique sua conexão e tente novamente");
            }
        });
    }

    render() {
        return (
            <>
                <CriarPublicacao url="/feed/publicacoes" publish_url="ATUALIZAR_FEED" />
                <Publicacoes publicacoes={this.state.publicacoes} />
            </>
        )
    }
}

class CriarPublicacao extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anexoAdicionado: false,
            nomeAnexo: null,
            texto: "",
            enviandoAjax: false,
            idAnexo: new Date().getTime()
        }

        // Binds
        this.handleAnexo = this.handleAnexo.bind(this);
        this.handleTexto = this.handleTexto.bind(this);
        this.addAnexo = this.addAnexo.bind(this);
        this.salvaPublicacao = this.salvaPublicacao.bind(this);
    }

    addAnexo() {
        $("#" + this.state.idAnexo).trigger('click');
    }

    handleAnexo(e) {
        this.setState({
            anexoAdicionado: e.target.files.length > 0,
            nomeAnexo: e.target.files[0] ? e.target.files[0].name : null,
        });
    }

    handleTexto(e) {
        const { value } = e.target;
        this.setState({
            texto: value,
        })
    }

    salvaPublicacao() {
        this.setState({
            enviandoAjax: true,
        });
        const formData = new FormData();
        formData.append("conteudo", this.state.texto);
        formData.append("anexo", document.getElementById(this.state.idAnexo).files[0]);
        formData.append("nomeAnexo", this.state.nomeAnexo);

        $.ajax({
            url: this.props.url,
            method: "POST",
            contentType: false,
            processData: false,
            data: formData,
            headers: headerAjax,
            success: () => {
                swal({
                    title: "Publicação realizada com sucesso!",
                    icon: "success",
                    timer: 2000,
                });

                this.setState({
                    anexoAdicionado: false,
                    nomeAnexo: null,
                    texto: "",
                    enviandoAjax: false,
                });

                PubSub.publish(this.props.publish_url);
            },
            error: (data) => {
                if (data.responseJSON.erro) {
                    disparaErro(data.responseJSON.erro);
                } else {
                    disparaErro("Ocorreu um erro ao realizar a publicação. Por favor, cheque sua conexão e tente novamente.");
                }

                this.setState({
                    enviandoAjax: false,
                })
            }
        });
    }

    render() {

        const P = styled.p`
            color: white;
            display: inline-block;
            margin: 0 5px 0 0;
        `;

        return (
            <div style={{ paddingBottom: "1rem", borderBottom: "1px solid white" }}>
                <textarea
                    style={{ resize: "none" }}
                    className="form-control"
                    placeholder="No que você está pensando?"
                    value={this.state.texto}
                    onChange={this.handleTexto} />
                <div style={{ marginTop: "0.5rem" }}>
                    <input id={this.state.idAnexo} type="file" style={{ display: "none" }} onChange={this.handleAnexo} />
                    <MiniBotao type="button" className="btn" onClick={this.addAnexo}>
                        <Icone
                            className="fas fa-paperclip"
                            style={{
                                color: this.state.anexoAdicionado ? "var(--azul-bonito)" : "",
                            }}
                            title={this.state.anexoAdicionado ? this.state.nomeAnexo : "Adicionar anexo"} />
                    </MiniBotao>
                    <MiniBotao
                        type="button"
                        className="btn"
                        disabled={this.state.texto === "" || this.state.enviandoAjax === true}
                        title={this.state.texto === "" ? "Escrevar algo para publicar" : ""}
                        onClick={this.salvaPublicacao}>
                        <P>Publicar</P><Icone className="far fa-paper-plane" title="Salvar" />
                    </MiniBotao>
                </div>
            </div>
        )
    }
}

function Publicacoes(props) {
    return props.publicacoes.map((publicacao, i) => <Publicacao key={i} publicacao={publicacao} />)
}

class Publicacao extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props.publicacao,
            liking: false,
        };

        // Binds
        this.excluirPublicacao = this.excluirPublicacao.bind(this);
        this.curtirPublicacao = this.curtirPublicacao.bind(this);
        this.abreModal = this.abreModal.bind(this);
    }

    excluirPublicacao() {
        swal({
            title: "Excluir publicação",
            text: "Tem certeza que deseja excluir essa publicação?",
            icon: "warning",
            buttons: {
                cancel: {
                    visible: true,
                    text: "Cancelar",
                },
                confirm: {
                    visible: true,
                    text: "Confirmar",
                    closeModal: false,
                }
            }
        }).then(val => {
            if (!val) {
                return false;
            }

            $.ajax({
                url: `/feed/publicacoes/${this.state.publicacao_id}`,
                method: "DELETE",
                headers: headerAjax,
                success: (data) => {
                    PubSub.publish("ATUALIZAR_FEED");
                    swal({
                        title: "Sucesso!",
                        text: "Publicação excluída com sucesso.",
                        icon: "success",
                        timer: 1500,
                    });
                },
                error: (data) => {
                    if (data.responseJSON && data.responseJSON.erro) {
                        disparaErro(data.responseJSON.erro);
                    } else {
                        disparaErro("Ocorreu um erro ao excluir a publicação. Por favor, verifique sua conexão e tente novamente");
                    }
                }
            });
        })
    }

    curtirPublicacao() {
        this.setState({
            liking: true,
        })
        $.ajax({
            url: `/feed/publicacoes/curtir/${this.state.publicacao_id}`,
            method: "POST",
            headers: headerAjax,
            success: () => {
                this.setState(state => {
                    return {
                        liked: !state.liked,
                        liking: false,
                        likes: !state.liked ? state.likes + 1 : state.likes - 1
                    }
                })
            },
            error: (data) => {
                if (data.responseJSON.erro) {
                    disparaErro(data.responseJSON.erro);
                } else {
                    disparaErro("Ocorreu um erro ao curtir a publicação. Por favor, cheque sua conexão e tente novamente.");
                }

                this.setState({
                    liking: false,
                })
            }
        });
    }

    abreModal() {
        PubSub.publish("ABRIR_MODAL", this.state.publicacao_id);
    }

    render() {

        return (
            <Wrapper>
                <Avatar src={this.state.foto} style={{ marginBottom: "0.5rem" }} />

                <P>{this.state.usuario}</P>
                <P style={{ float: "right", fontSize: "0.8rem" }}>{moment(this.state.quando).fromNow()}</P>

                <BlocoPublicacao>
                    <P>{this.state.conteudo}</P>
                    {(this.state.link && this.state.tipo_link.includes("image")) &&
                        <div style={{ textAlign: "center" }}>
                            <img src={this.state.link}
                                style={{ maxWidth: "100%", maxHeight: "200px" }} />
                        </div>
                    }
                    {(this.state.link && this.state.tipo_link.includes("video")) &&
                        <div style={{ textAlign: "center" }}>
                            <video
                                controls
                                style={{ maxWidth: "100%", maxHeight: "200px" }}>
                                <source src={this.state.link} type={this.state.tipo_link} />
                            </video>
                        </div>
                    }
                </BlocoPublicacao>

                <Botao
                    liking={this.state.liking}
                    onClick={this.curtirPublicacao}
                    title={this.state.likes + " likes"}
                    className={this.state.liked ? "fas fa-thumbs-up" : "far fa-thumbs-up"} />
                <Botao title="Responder/Ver respostas" onClick={this.abreModal} className="far fa-comment" />
                <Botao title="Traduzir" className="fas fa-language" />
                {/* Excluir publicação */}
                {this.state.minha_publicacao === true &&
                    <Botao onClick={this.excluirPublicacao} btnExcluir="true" title="Excluir Publicação" className="far fa-trash-alt" />
                }
            </Wrapper >
        )
    }
}

function Botao(props) {
    return (
        <MiniBotao
            onClick={props.onClick}
            type="button"
            className="btn"
            disabled={props.liking}
            title={props.title}
            style={props.btnExcluir ? { float: "right", margin: 0 } : null}>
            <Icone style={props.btnExcluir ? { color: "#b72e2e" } : null} className={props.className} />
        </MiniBotao>
    )
}

class Comentarios extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comentarios: [],
            publicacao_id: null
        }

        // Binds
        this.atualizarRespostas = this.atualizarRespostas.bind(this);
    }

    componentDidMount() {
        PubSub.subscribe("ABRIR_MODAL", (e, publicacao_id) => {
            this.setState({
                publicacao_id
            });

            this.atualizarRespostas(() => {
                jQuery("#modalComentarios").modal();
            });
        });

        PubSub.subscribe("ATUALIZAR_RESPOSTAS", () => {
            this.atualizarRespostas();
        });
    }

    /**
     * Atualiza as respostas e roda um callback após
     * @param {function} callback 
     */
    atualizarRespostas(callback = () => { }) {
        $.ajax({
            url: `/feed/publicacoes/${this.state.publicacao_id}/comentarios`,
            success: (comentarios) => {
                // Reseta comentários
                this.setState({
                    comentarios: [],
                });
                // Popula a lista novamente
                this.setState({
                    comentarios,
                });

                callback();
            },
            error: () => {
                disparaErro("Ocorreu um erro ao buscar os comentários. Por favor, verifique sua conexão e tente novamente.");
            }
        })
    }

    render() {
        return (
            <>
                <CriarPublicacao
                    url={"/feed/publicacoes/" + this.state.publicacao_id + "/comentar"}
                    publish_url="ATUALIZAR_RESPOSTAS" />
                {this.state.comentarios.map((comentario, i) => <Comentario key={i} comentario={comentario} />)}
            </>
        );
    }
}

function Comentario(props) {

    function excluirComentario() {
        swal({
            title: "Excluir comentário",
            text: "Tem certeza que deseja excluir este comentário?",
            icon: "warning",
            buttons: {
                cancel: {
                    visible: true,
                    text: "Cancelar",
                },
                confirm: {
                    visible: true,
                    text: "Confirmar",
                    closeModal: false,
                }
            }
        }).then(val => {
            if (!val) {
                return false;
            }

            $.ajax({
                url: `/feed/publicacoes/comentario/${props.comentario.rp_id}`,
                method: "DELETE",
                headers: headerAjax,
                success: (data) => {
                    PubSub.publish("ATUALIZAR_RESPOSTAS");
                    swal({
                        title: "Sucesso!",
                        text: "Comentário removido com sucesso.",
                        icon: "success",
                        timer: 1500,
                    });
                },
                error: (data) => {
                    if (data.responseJSON && data.responseJSON.erro) {
                        disparaErro(data.responseJSON.erro);
                    } else {
                        disparaErro("Ocorreu um erro ao excluir o comentário. Por favor, verifique sua conexão e tente novamente");
                    }
                }
            });
        })
    }

    return (
        <Wrapper>
            <Avatar src={props.comentario.foto} style={{ marginBottom: "0.5rem" }} />

            <P>{props.comentario.usuario}</P>
            <P style={{ float: "right", fontSize: "0.8rem" }}>{moment(props.comentario.quando).fromNow()}</P>

            <BlocoPublicacao>
                <P>{props.comentario.conteudo}</P>
                {(props.comentario.link && props.comentario.tipo_link.includes("image")) &&
                    <div style={{ textAlign: "center" }}>
                        <img src={props.comentario.link}
                            style={{ maxWidth: "100%", maxHeight: "200px" }} />
                    </div>
                }
                {(props.comentario.link && props.comentario.tipo_link.includes("video")) &&
                    <div style={{ textAlign: "center" }}>
                        <video
                            controls
                            style={{ maxWidth: "100%", maxHeight: "200px" }}>
                            <source src={props.comentario.link} type={props.comentario.tipo_link} />
                        </video>
                    </div>
                }
            </BlocoPublicacao>

            {/* Excluir comentário */}
            {props.comentario.minha_publicacao === true &&
                <Botao onClick={excluirComentario} btnExcluir="true" title="Excluir Publicação" className="far fa-trash-alt" />
            }
        </Wrapper>
    )
}

moment.locale('pt-br');

ReactDom.render(
    <Feed />,
    document.getElementById("feed")
)

ReactDom.render(
    <Comentarios />,
    document.getElementById("corpoModal")
)