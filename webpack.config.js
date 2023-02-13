const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = 'style-loader';



const config = {
    entry: './src/index.jsx',
    resolve: {
        alias: {
            '~': __dirname + '/src',
            modernizr$: path.resolve(__dirname, '.modernizrrc')
        },
        extensions: ['.js', '.jsx'],
        modules: [path.resolve(__dirname, "src"), 'node_modules']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "index.js"
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'static/index.html',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                use: "babel-loader"
            },
            {
                test: /\.css$/i,
                use: [stylesHandler,'css-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};
