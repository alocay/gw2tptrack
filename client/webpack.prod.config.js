var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var pkg = require('./package.json');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var paths = {
    app: path.join(__dirname, 'app'),
    dist: path.join(__dirname, '../dist')
};

// bundle dependencies in separate vendor bundle
var vendorPackages = Object.keys(pkg.dependencies).filter(function (el) {
    return el.indexOf('font') === -1; // exclude font packages from vendor bundle
});

var outputFileTemplateSuffix = '-' + pkg.version;

module.exports = {
    entry: {
        main: [
            './app/index'
        ],
        vendor: vendorPackages
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    output: {
        path: paths.dist,
        filename: '[name]' + outputFileTemplateSuffix + '.js',
        chunkFilename: '[id]' + outputFileTemplateSuffix + '.js',
        publicPath: './dist/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            __API_URL__: JSON.stringify(process.env.API_URL || 'http://localhost:3000'),
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor' + outputFileTemplateSuffix + '.js',
            minChunks: Infinity
        }),
        new HtmlWebpackPlugin({
            template: 'index.html'
        }),
        new CleanWebpackPlugin([paths.dist], {
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
