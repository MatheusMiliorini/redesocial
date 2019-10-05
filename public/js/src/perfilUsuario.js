import React, { Component } from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
import styled from 'styled-components';
import { Wrapper, Avatar, P } from '../src/components';
import { Publicacao, Comentarios } from '../src/Publicacao';
import moment from 'moment';
import PubSub from 'pubsub-js';
import update from 'immutability-helper';

class Perfil extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url_unica,
            interesses: [],
            perfil: {},
            publicacoes: [],
            idiomas: [],
            btnSeguirHabilitado: true,
        }

        // Binds
    }

    componentDidMount() {
        $.ajax({
            url: `/perfil/${this.state.url_unica}/getAll`,
            success: (data) => {
                this.setState({
                    interesses: data.interesses,
                    perfil: data.perfil,
                    publicacoes: data.publicacoes,
                    idiomas: data.idiomas,
                });
            },
            error: () => {
                disparaErro("Não foi possível buscar os dados do usuário. Por favor, verifique sua conexão e tente novamente.");
            }
        })

        PubSub.subscribe("SEGUIR_USUARIO", () => {
            this.setState({
                btnSeguirHabilitado: false,
            });

            $.ajax({
                url: "/conexoes",
                method: "POST",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data: {
                    "outro": this.state.perfil.usuario_id,
                    "seguindo": this.state.perfil.seguindo,
                },
                success: () => {
                    this.setState((state) => {
                        return {
                            btnSeguirHabilitado: true,
                            perfil: update(state.perfil, { seguindo: { $set: !state.perfil.seguindo } })
                        }
                    });
                },
                error: () => {
                    this.setState({
                        btnSeguirHabilitado: true,
                    });
                    disparaErro("Ocorreu um erro ao seguir/parar de seguir o usuário. Por favor, cheque sua conexão e tente novamente");
                }
            });
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


    render() {
        return (
            <div>
                <Usuario
                    perfil={this.state.perfil}
                    interesses={this.state.interesses}
                    idiomas={this.state.idiomas}
                    btnHabilitado={this.state.btnSeguirHabilitado} />
                <Publicacoes
                    publicacoes={this.state.publicacoes} />
            </div>
        )
    }
}

function Publicacoes(props) {
    return props.publicacoes.map((publicacao, i) => <Publicacao key={i} publicacao={publicacao} />)
}

function Usuario(props) {
    const P2 = styled.p`
            color: white;
            font-weight: bold;
            margin: 0;
        `;

    const BtnSeguir = styled.button`
            float: right;
        `;

    function segueUsuario() {
        PubSub.publish("SEGUIR_USUARIO");
    }

    let idiomasArr = props.idiomas.map((idioma, i) => `${idioma.nome} (${idioma.nivel_conhecimento})`);
    idiomasArr = <P>{idiomasArr.join(", ")}</P>;
    let interessesArr = props.interesses.map((int) => int.nome);
    interessesArr = <P>{interessesArr.join(", ")}</P>;

    return (
        <Wrapper>
            <Avatar src={props.perfil.foto} />
            <BtnSeguir className="btn btn-info" disabled={!props.btnHabilitado} onClick={segueUsuario}>{props.perfil.seguindo ? "Seguindo" : "Seguir"}</BtnSeguir>
            <P>{props.perfil.nome}</P>
            <br />
            <P>{props.perfil.localizacao}</P>
            <br />
            {props.perfil.nascimento &&
                <>
                    <P2>Nascimento:</P2>
                    <P>{moment(props.perfil.nascimento).format('DD/MM/YYYY')}</P>
                </>
            }
            <P2>Idiomas:</P2>
            {idiomasArr}
            <P2>Interesses:</P2>
            {interessesArr}
            {props.perfil.site &&
                <>
                    <P2>Site:</P2>
                    <P>{props.perfil.site}</P>
                </>
            }
            {props.perfil.biografia &&
                <>
                    <P2>Biografia:</P2>
                    <P>{props.perfil.biografia}</P>
                </>
            }
        </Wrapper>
    )
}

ReactDom.render(
    <Perfil />,
    document.getElementById("perfil")
)

ReactDom.render(
    <Comentarios />,
    document.getElementById("corpoModal")
)