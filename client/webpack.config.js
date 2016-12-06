var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var pkg = require('./package.json');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var paths = {
    app: path.join(__dirname, 'app'),
    build: path.join(__dirname, '../dev')
};

// bundle dependencies in separate vendor bundle
var vendorPackages = Object.keys(pkg.dependencies).filter(function (el) {
    return el.indexOf('font') === -1; // exclude font packages from vendor bundle
});

var outputFileTemplateSuffix = '-' + pkg.version;

module.exports = {
    //node: { fs: "empty", },
    devtool: 'eval',
    entry: {
        main: [
          //'webpack-dev-server/client?http://localhost:3000',
          //'webpack/hot/only-dev-server',
          './app/index'
        ],
        vendor: vendorPackages
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    output: {
        path: paths.build,
        filename: '[name].js',
        publicPath: './'
    },
    /*devServer: {
        contentBase: paths.build,
        host: process.env.HOST,
        port: 3001,
        historyApiFallback: true
    },*/
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            __API_URL__: JSON.stringify(process.env.API_URL || 'http://localhost:3000')
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.js',
            minChunks: Infinity
        }),
        new HtmlWebpackPlugin({
            template: 'index.html'
        }),
        new webpack.ProvidePlugin({
            'Promise': 'es6-promise', // Thanks Aaron (https://gist.github.com/Couto/b29676dd1ab8714a818f#gistcomment-1584602)
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        }),
        new CleanWebpackPlugin([paths.build], {
          root: path.join(__dirname, '..'),
          varbose: true,
          dry: false
        })
    ],
    resolveLoader: {
        'fallback': path.join(__dirname, 'node_modules')
    },
    module: {
        loaders: [
            {
              test: /\.css$/,
              loaders: ['style', 'css']
            },
            {
              test: /\.scss$/,
              loaders: ['style', 'css', 'sass']
            },
            {
              test: /\.(jpe?g|png|gif|svg)$/i,
              loaders: [
                'file?hash=sha512&digest=hex&name=[hash].[ext]',
                'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
              ]
            },
            {
              test: /\.svg$/,
              loader: 'svg-inline'
            },
            {
              test: /\.jsx$/,
              loaders: ['react-hot', 'babel'],
              exclude: /node_modules/
            },
            {
              test: /\.json$/,
              loaders: ['json-loader']
            },
            {
              test: /\.js$/,
              loaders: ['react-hot', 'babel'],
              exclude: /node_modules/
            }
        ]
    }
};
