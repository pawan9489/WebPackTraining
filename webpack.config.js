const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const env = process.env.NODE_ENV;
// set NODE_ENV=dev && in the package.json "Scripts"
const config = {
    entry: './src/js/index.js',
    output: {
        path: path.resolve(__dirname,'build'),
        filename: 'bundle.js',
        publicPath: 'build'
    },
    module: {
        loaders: [
            {
                use: 'babel-loader',
                test: /\.js$/
            },
            {
                use: ExtractTextPlugin.extract({
                    use: "css-loader"
                }),
                test: /\.css$/,
                // use: env === 'dev'
                //     ? ExtractTextPlugin.extract({
                //         fallback: 'style-loader',
                //         use: [ 'css-loader' ]
                //     })
                //     : [ 'style-loader', 'css-loader' ]

            },
            {
                // use: [
                //     {
                //         loader: 'url-loader',
                //         options: {
                //             limit: 10000
                //         }
                //     },
                //     'image-webpack-loader'
                // ],
                // loader: 'url-loader',
                // options: {
                //     limit: 10000
                // },
                // use: [
                //     'url-loader?limit=50000',
                //     'image-webpack-loader'
                // ],
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000
                        }
                    }
                ],
                test: /\.(jpe?g|gif|png|svg|eot|ttf|woff|woff2)$/
            }
        ]
    },
    // plugins: [
    //     new ExtractTextPlugin({
    //         filename: "style.css",
    //         disabled: false,
    //         allChunks: true
    //     }),
    //     new webpack.optimize.ModuleConcatenationPlugin()
    // ]
    plugins: [
        new ExtractTextPlugin({
            filename: "style.css",
            allChunks: true
        })
    ]
};

module.exports = config;
