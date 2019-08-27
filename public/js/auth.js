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
                    busca: $input.val()
                },
                success: function (data) {
                    if (data.length === 0) {
                        $("#btnAddInteresseBase").show();
                        response();
                    } else {
                        $("#btnAddInteresseBase").hide();
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
            // ADICIONAR EM TELA
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
 */
$("#btnAddInteresseBase").click(function () {
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
            debugger;
            $input.val("");
            $(this).hide();
            $input.focus();
            // ADICIONA NA LISTA
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
}