$("#btnCadastrar").click(function (e) {
    e.preventDefault();
    const email = $("#email").val(),
        senha = $("#senha").val(),
        nome = $("#nome").val();

    if (email === "") {
        $("#email").addClass("is-invalid");
        return;
    } else if (senha === "") {
        $("#senha").addClass("is-invalid");
        return;
    } else if (nome === "") {
        $("#nome").addClass("is-invalid");
        return;
    }

    $.ajax({
        url: "/cadastro",
        method: "POST",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: $('form').serialize(),
        success() {
            swal({
                title: "Sucesso!",
                icon: "success",
                text: "Vamos para a próxima etapa!",
            });
            setTimeout(() => {
                location.href = "/completarcadastro"
            }, 2000);
        },
        error(data) {
            data = data.responseJSON;
            if (data.errors.email) {
                swal({
                    title: "Oops",
                    icon: "error",
                    text: data.errors.email[0],
                })
            } else {
                swal({
                    title: "Oops",
                    icon: "error",
                    text: "Ocorreu um erro ao relizar o cadastro inicial",
                })
            }
        }
    })
});

$("#btnLogar").click(function (e) {
    e.preventDefault();
    const email = $("#email").val(),
        senha = $("#senha").val();

    if (email === "") {
        $("#email").addClass("is-invalid");
        return;
    } else if (senha === "") {
        $("#senha").addClass("is-invalid");
        return;
    }

    $.ajax({
        url: "/login",
        method: "POST",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: {
            email,
            senha
        },
        success(data) {
            if (!data.completou_login) {
                swal({
                    title: "Falta pouco!",
                    text: "Vamos completar seu cadastro...",
                    icon: "info"
                });
                setTimeout(() => {
                    location.href = "/completarcadastro"
                }, 1000);
            } else {
                location.href = "/feed"
            }
        },
        error(data) {
            const { erro } = data.responseJSON;
            if (erro) {
                swal({
                    title: "Oops",
                    icon: "error",
                    text: erro,
                })
            } else {
                swal({
                    title: "Oops",
                    icon: "error",
                    text: "Ocorreu um erro ao relizar o login"
                })
            }
        }
    })
});

$("#btnRecuperarSenha").click(function () {
    let email = $('#email').val();

    $.ajax({
        url: "/recuperarSenha",
        method: "POST",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: {
            email
        },
        success: () => {
            swal({
                title: "Sucesso!",
                text: "Verifique sua caixa de entrada para continuar",
            });
            setTimeout(() => {
                location.href = '/login';
            }, 1000);
        },
        error: (data) => {
            const { erro } = data.responseJSON;
            if (erro) {
                swal({
                    title: "Oops",
                    icon: "error",
                    text: erro,
                })
            } else {
                swal({
                    title: "Oops",
                    icon: "error",
                    text: "Ocorreu um erro ao enviar o e-mail de recuperação."
                })
            }
        }
    })
});

$("#btnSalvarSenha").click(function () {
    let senha = $("#senha").val(),
        senha2 = $("#senha2").val();

    $.ajax({
        url: "/recuperarSenha",
        method: "PUT",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: {
            senha,
            senha2,
            token_recuperacao
        },
        success: () => {
            swal({
                title: "Sucesso!",
                icon: 'success',
                text: "Senha alterada com sucesso",
            });
            setTimeout(() => {
                location.href = '/login';
            }, 1000);
        },
        error: (data) => {
            const { erro } = data.responseJSON;
            if (erro) {
                swal({
                    title: "Oops",
                    icon: "error",
                    text: erro,
                })
            } else {
                swal({
                    title: "Oops",
                    icon: "error",
                    text: "Ocorreu um erro ao alterar a senha. Por favor, cheque sua conexão e tente novamente.",
                })
            }
        }
    })
});

/**
 * Clicar na imagem abre o upload
 */
$(".avatarPerfil").click(function () {
    $(this).next().click();
});

/**
 * Seta o preview da imagem que será enviada
 * https://stackoverflow.com/questions/14069421/show-an-image-preview-before-upload
 */
$("#uploadAvatar").change(function (e) {
    var reader = new FileReader();

    reader.onload = function (e) {
        // get loaded data and render thumbnail.
        document.getElementsByClassName("avatarPerfil")[0].src = e.target.result;
    };

    // read the image file as a data URL.
    reader.readAsDataURL(this.files[0]);
});


/**
 * Configura o autocomplete para os interesses
 */
function setupAutoCompleteInteresses() {
    const $input = $("#searchInteresses");

    $input.autocomplete({
        source: function (request, response) {
            jQuery.ajax({
                url: "/interesses",
                dataType: "json",
                cache: false,
                data: {
                    busca: request.term
                },
                success: function (data) {
                    if (data.length === 0) {
                        $("#sugestaoInteresse").text(request.term).parent().show();
                        response();
                    } else {
                        $("#sugestaoInteresse").text("").parent().hide();
                        response(data.map(item => {
                            return {
                                label: item.nome,
                                value: item.interesse_id,
                            };
                        }));
                    }
                }
            });
        },
        minLength: 1,
        autoFocus: false,
        focus(event, ui) {
            $input.val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            addInteresseLista({ "interesse_id": ui.item.value, "nome": ui.item.label });
            $input.val("");
            return false;
        },
        response: function (event, ui) {
            $input.removeClass("loadingBG");
            return false;
        },
        search: function (event, ui) {
            $input.addClass("loadingBG");
        }
    }).data("ui-autocomplete")._renderItem = function (ul, item) {
        return $("<li></li>")
            .data("item.autocomplete", item)
            .append("<a>" + item.label + "</a>")
            .appendTo(ul);
    };
}

/**
 * Envia AJAX para cadastrar interesses ausentes
 * O next é o <i>
 */
$("#sugestaoInteresse").next().click(function () {
    const $input = $("#searchInteresses"),
        nome = $input.val();

    $.ajax({
        url: "/interesses",
        method: "POST",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: {
            nome,
        },
        success: (data) => {
            $input.val("");
            $(this).parents(".addAutocomplete").hide();
            $input.focus();
            // ADICIONA NA LISTA
            addInteresseLista(data);
        },
        error(data) {

        }
    })
});

/**
 * Adiciona um interesse à lista de interesses em tela
 * @param {{}} interesse 
 */
function addInteresseLista(interesse) {
    const { interesse_id, nome } = interesse;

    const html = `
        <div class="escolhaMiniatura aux" title="Clique para remover" data-interesse-id="${interesse_id}">${nome}</div>
    `;

    $("#wrapperInteresses").append(html);

    // Remove ao clicar
    $(".aux").click(function () {
        $(this).remove();
    }).removeClass("aux");
}

/**
 * Tela de completar cadastro
 */
if (location.href.includes("/completarcadastro")) {
    // Localização do usuário via IP
    $.ajax({
        url: "http://ip-api.com/json/",
        dataType: "json",
        data: {
            lang: "pt-BR",
        },
        success(data) {
            $('[name="localizacao"]').val(`${data.city}, ${data.region}`);
        },
        error(e) {
            console.error(e);
        }
    });
    setupAutoCompleteInteresses();

    $("#btnFinalizar").click(function () {
        /* let dados = $('form').serialize();
        dados += `&interesses=${getInteresses()}`; */
        let dados = new FormData(document.getElementById("formCompletarCadastro"));
        dados = getInteresses(dados);

        $.ajax({
            url: "/completarcadastro",
            method: "POST",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: dados,
            processData: false,
            contentType: false,
            success() {
                swal({
                    title: "Sucesso!",
                    text: "Sua conta foi criada com sucesso!",
                    icon: "success",
                });
                setTimeout(() => {
                    location.href = "/feed";
                }, 1500);
            },
            error(data) {
                let erro = "Ocorreu um erro... Por favor, tente novamente!";
                if (data.responseJSON.errors) {
                    try {
                        erro = data.responseJSON.errors[Object.keys(data.responseJSON.errors)[0]][0];
                    } catch (e) {
                        console.warn(e);
                    }
                }
                swal({
                    title: "Oops...",
                    text: erro,
                    icon: "error",
                });
            }
        });
    });

    /**
     * Itera todos os interesses selecionados e adiciona-os ao formData
     * @param {formData} formData
     * @returns {formData} FormData atualizado
     */
    function getInteresses(formData) {
        $('[data-interesse-id]').map((i, el) => {
            formData.append("interesse_id[]", $(el).attr("data-interesse-id"));
        });
        return formData;
    }
}