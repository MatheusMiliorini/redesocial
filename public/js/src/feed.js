import React, { Component } from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
import styled from 'styled-components';
import { Wrapper, Avatar, P, Icone, MiniBotao } from '../src/components';
import moment from 'moment';

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
    }

    atualizaFeed() {
        $.ajax({
            url: "/feed/publicacoes",
            method: "GET",
            success: (publicacoes) => {
                this.setState({
                    publicacoes
                });
            },
            error: (data) => {
                disparaErro("Ocorreu um erro ao buscar as publicações. Por favor, verifique sua conexão e tente novamente");
            }
        });
    }

    render() {
        return (
            <React.Fragment>
                <CriarPublicacao atualizaFeed={this.atualizaFeed} />
                <Publicacoes publicacoes={this.state.publicacoes} />
            </React.Fragment>
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
        }

        // Binds
        this.handleAnexo = this.handleAnexo.bind(this);
        this.handleTexto = this.handleTexto.bind(this);
        this.salvaPublicacao = this.salvaPublicacao.bind(this);
    }

    addAnexo() {
        $('#anexo').trigger('click');
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
        const formData = new FormData();
        formData.append("conteudo", this.state.texto);
        formData.append("anexo", document.getElementById("anexo").files[0]);
        formData.append("nomeAnexo", this.state.nomeAnexo);

        $.ajax({
            url: "/feed/publicacoes",
            method: "POST",
            contentType: false,
            processData: false,
            data: formData,
            headers: headerAjax,
            success: (data) => {
                swal({
                    title: "Publicação realizada com sucesso!",
                    icon: "success",
                    timer: 2000,
                });

                this.setState({
                    anexoAdicionado: false,
                    nomeAnexo: null,
                    texto: "",
                });

                this.props.atualizaFeed();
            },
            error: (data) => {
                if (data.responseJSON.erro) {
                    disparaErro(data.responseJSON.erro);
                } else {
                    disparaErro("Ocorreu um erro ao realizar a publicação. Por favor, cheque sua conexão e tente novamente.");
                }
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
                    <input id="anexo" type="file" style={{ display: "none" }} onChange={this.handleAnexo} />
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
                        disabled={this.state.texto === ""}
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
        };
    }

    render() {

        const BlocoPublicacao = styled.div`
            border-radius: 0.25rem;
            border: 1px solid white;
            clear: both;
            padding: 0.5rem;
            margin-bottom: 0.25rem;
        `;

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

                <Botao title="Curtir Publicação" className="far fa-thumbs-up" />
                <Botao title="Responder/Ver respostas" className="far fa-comment" />
                <Botao title="Traduzir" className="fas fa-language" />
            </Wrapper >
        )
    }
}

function Botao(props) {
    return (
        <MiniBotao type="button" className="btn" title={props.title}>
            <Icone className={props.className} />
        </MiniBotao>
    )
}

moment.locale('pt-br');

ReactDom.render(
    <Feed />,
    document.getElementById("feed")
)