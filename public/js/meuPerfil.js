setupAutoCompleteInteresses();

$("#btnFinalizar").click(function () {
    let dados = new FormData(document.getElementById("formCompletarCadastro"));
    dados = getInteresses(dados);

    $.ajax({
        url: "/meuPerfil",
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
                text: "Perfil atualizado com sucesso!",
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
            } else if (data.responseJSON.erro) {
                erro = data.responseJSON.erro
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
        <div class="escolhaMiniatura" title="Clique para remover" data-interesse-id="${interesse_id}">${nome}</div>
    `;

    $("#wrapperInteresses").append(html);
}

$('#wrapperInteresses').on('click', '.escolhaMiniatura', function () {
    $(this).remove();
});