/**
 * Webpack client-side config file
 */
const path = require( 'path' );
const webpack = require( 'webpack' );
const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
const config = require( './common/config' );

// server details
const devServer = config.devServer;
const mainServer = config.mainServer;

// global stuff
const cssVars = './client/scss/globals';
const isProd = ( process.env.NODE_ENV === 'production' );

// hot reload vue css in development
const vueDevLoaders = {
  scss: 'vue-style-loader!css-loader!postcss-loader!sass-loader?data=@import "'+ cssVars +'";'
}

// extract vue css in production build
const vueProdLoaders = {
  scss: ExtractTextPlugin.extract({
    use: 'css-loader!postcss-loader!sass-loader?data=@import "'+ cssVars +'";',
    fallback: 'vue-style-loader'
  })
}

module.exports = {
  devtool: '#eval-source-map',
  entry: {
    app: './client/main.js',
  },
  output: {
    path: mainServer.public,
    publicPath: '/',
    filename: 'dist/[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg|map|css|eot|woff|woff2|ttf)$/,
        loader: 'ignore-loader',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: isProd ? vueProdLoaders : vueDevLoaders
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin( 'dist/[name].bundle.css' )
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devServer: {
    host: devServer.host,
    port: devServer.port,
    contentBase: mainServer.public,
    clientLogLevel: 'info',
    historyApiFallback: {
      index: devServer.fallback,
    },
    proxy: {
      '/': {
        target: 'http://'+ mainServer.host +':'+ mainServer.port +'/',
        secure: false,
      }
    },
    hot: true,
    inline: true,
    quiet: false,
    noInfo: false,
    compress: false,
  },
  performance: {
    hints: false
  }
}

if ( isProd ) {
  module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
