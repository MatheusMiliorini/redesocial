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

// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/service-worker.js')
//             .then((reg) => {
//                 console.log('Service worker registered.', reg);
//             });
//     });
// }