const path = require('path');

module.exports = {
    entry: {
        'feed': './public/js/src/feed.js',
        'completarcadastro': './public/js/src/completarcadastro.js',
        'conexoes': './public/js/src/conexoes.js',
        'perfilUsuario': './public/js/src/perfilUsuario.js',
        'conversas': './public/js/src/conversas.js',
    },
    output: {
        path: path.resolve(__dirname, 'public/js/dist'),
        filename: '[name].js'
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/react', '@babel/env']
                }
            }
        ]
    }
};