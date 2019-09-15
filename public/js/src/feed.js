import React, { Component } from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
import styled from 'styled-components';

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
        console.log("Feed Atualizado");
        $.ajax({
            url: "/feed/publicacoes",
            method: "GET",
            success: (publicacoes) => {

            },
            error: (data) => {

            }
        });
    }

    render() {
        return (
            <React.Fragment>
                <CriarPublicacao atualizaFeed={this.atualizaFeed} />
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

        const Icone = styled.i`
            color: var(--mostarda);
            font-size: 1.2rem;
        `;

        const MiniBotao = styled.button`
            border: 1px solid #2E4052;
            margin-right: 0.5rem;
        `;

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

ReactDom.render(
    <Feed />,
    document.getElementById("feed")
)