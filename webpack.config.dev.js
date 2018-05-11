// const webpack = require('webpack'); //访问内置的插件

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.config.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");




function resolve(dir) {
    return path.resolve(__dirname, dir)
}


const config = merge(commonConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ],
            },
        ]
    },
    plugins: [
        // mode=development
        // 会将 process.env.NODE_ENV 的值设为 development。启用 NamedChunksPlugin 和 NamedModulesPlugin。
        new webpack.HotModuleReplacementPlugin(),
    ],
});


/*const config = {
    mode: 'development',
    entry: './src/entry.js',
    output: {
        // filename: '[name].[hash].js',  //name代表entry对应的名字; hash代表 整个app打包完成后根据内容加上hash。一旦整个文件内容变更，hash就会变化
        filename: '[name].[hash].js',
        path: resolve('dist-prepare'),
        publicPath: '/' // 静态资源文件引用时的路径（加在引用静态资源前面的）

    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.js$/, //使用loader的目标文件。这里是.js
                loader: 'babel-loader',
                exclude: [
                    resolve('node_modules')  // 由于node_modules都是编译过的文件，这里我们不让babel去处理其下面的js文件
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ],
            },
            {
                test: /\.(png|jpe?g|ico|otf|gif|svg|woff|ttf|eot)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            // fallback: 'file-loader',
                            // Default file-loader config
                            name: '[path][name].[ext]',
                            outputPath: '/',
                            publicPath: '/'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        // mode=development
        // 会将 process.env.NODE_ENV 的值设为 development。启用 NamedChunksPlugin 和 NamedModulesPlugin。
        new webpack.HotModuleReplacementPlugin(),
    ],
};*/


module.exports = config;