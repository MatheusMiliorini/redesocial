import React, { Component } from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
import { Publicacao, Comentarios, CriarPublicacao } from '../src/Publicacao';
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

        PubSub.subscribe("TRADUZIR", (msg, data) => {
            $.ajax({
                url: "/traduzir",
                method: "POST",
                headers: headerAjax,
                data: {
                    texto: data,
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

function Publicacoes(props) {
    return props.publicacoes.map((publicacao, i) => <Publicacao key={i} publicacao={publicacao} />)
}

ReactDom.render(
    <Feed />,
    document.getElementById("feed")
)

ReactDom.render(
    <Comentarios />,
    document.getElementById("corpoModal")
)