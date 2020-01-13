const webpack = require('webpack');
const path = require('path');


const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");



const config = {
    entry: {
        main: './src/scenarioGraph.js',
        styles: './src/scenarioGraph.css',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'scenarioGraph.[name].js',
        library: 'ScenarioGraph'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ["@babel/plugin-proposal-class-properties"]
                    }
                }
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({filename: "scenarioGraph.[name].css"}),
        new FixStyleOnlyEntriesPlugin(),
        new OptimizeCSSAssetsPlugin({})
    ]
};

module.exports = config;
