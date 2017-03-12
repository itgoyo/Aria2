var webpack = require('webpack');
var path = require('path');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
module.exports = {
    context: __dirname + '/src',
    entry: {
        home: './home.js',
        share: './share.js',
        album: './album.js',
        baidu:'./baidu.js',
        inject:'./inject.js'
    },
    output: {
        path:  __dirname + '/js',
        filename: '[name].js' // 为上面entry的key值
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin(),
    ],
};