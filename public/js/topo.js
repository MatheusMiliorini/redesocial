function disparaErro(msg) {
    swal({
        title: "Oops...",
        text: msg,
        icon: "error",
    });
}

const headerAjax = {
    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
};