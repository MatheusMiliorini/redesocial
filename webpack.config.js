const path = require('path');

module.exports = {
    entry: './public/js/src/completarcadastro.js',
    output: {
        path: path.resolve(__dirname, 'public/js/dist'),
        filename: 'completarcadastro.js'
    },
    mode: "development",
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