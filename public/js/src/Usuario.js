import React, { Component } from 'react';
import styled from 'styled-components';
import { Wrapper, Avatar, P } from './components';

export class Usuario extends Component {
    constructor(props) {
        super(props);
        this.state = {
            btnHabilitado: true,
            idiomas: JSON.parse(props.res.idiomas),
            interesses: JSON.parse(props.res.interesses),
            seguindo: props.res.seguindo,
        }

        // Binds
        this.segueUsuario = this.segueUsuario.bind(this);
        this.abrirPerfil = this.abrirPerfil.bind(this);
    }

    segueUsuario() {
        this.setState({
            btnHabilitado: false,
        });

        $.ajax({
            url: "/conexoes",
            method: "POST",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: {
                "outro": this.props.res.usuario_id,
                "seguindo": this.state.seguindo,
            },
            success: () => {
                this.setState((state) => {
                    return {
                        btnHabilitado: true,
                        seguindo: !state.seguindo
                    }
                });
            },
            error: () => {
                this.setState({
                    btnHabilitado: true,
                });
                disparaErro("Ocorreu um erro ao seguir/parar de seguir o usuário. Por favor, cheque sua conexão e tente novamente");
            }
        });
    }

    abrirPerfil() {
        location.href = `/perfil/${this.props.res.url_unica}`;
    }

    render() {
        const P2 = styled.p`
            color: white;
            font-weight: bold;
            margin: 0;
        `;

        const BtnSeguir = styled.button`
            float: right;
        `;

        let idiomasArr = this.state.idiomas.map((idioma, i) => `${idioma.idioma} (${idioma.nivel_conhecimento})`);
        idiomasArr = <P>{idiomasArr.join(", ")}</P>;
        const interessesArr = <P>{this.state.interesses.join(", ")}</P>;

        return (
            <Wrapper>
                <Avatar
                    onClick={this.abrirPerfil}
                    title="Abrir perfil"
                    src={this.props.res.foto} />
                <BtnSeguir className="btn btn-info" disabled={!this.state.btnHabilitado} onClick={this.segueUsuario}>{this.state.seguindo ? "Seguindo" : "Seguir"}</BtnSeguir>
                <P>{this.props.res.nome}</P>
                <br />
                <P>{this.props.res.localizacao}</P>
                <br />
                <P2>Idiomas:</P2>
                {idiomasArr}
                <P2>Interesses:</P2>
                {interessesArr}
            </Wrapper>
        );
    }
}