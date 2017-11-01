/**
 * Application config options.
 * IMPORTANT: rename this file to 'config.js' before app use.
 */
const path = require( 'path' );

module.exports = {

  // -------------------------
  // webpack dev server info
  devServer: {
    host: 'localhost',
    port: 8000,
    public: path.join( __dirname, '../public/' ),
    fallback: path.join( __dirname, '../server/views/template.html' ),
  },

  // -------------------------
  // main app server info
  mainServer: {
    host: 'localhost',
    port: 3000,
    public: path.join( __dirname, '../public/' ),
    routes: path.join( __dirname, '../server/routes/' ),
    views: path.join( __dirname, '../server/views/' ),
  },

  // -------------------------
  // secret keys
  keys: {

    // key used for crypt-ops on secure data
    crypt: '--some-random-32-chars-or-longer-hash--',

    // key used for fetching TV/Movie data from TheMovieDB
    moviedb: '--your-themoviedb-api-key--',
  },

  // -------------------------
  // server auth session options
  session: {

    // cookie name
    name: '_appsid_',

    // session duration (ttl)
    duration: 1000 * 60 * 60 * 24,
  },

  // -------------------------
  // server data/cache storage paths
  storage: {

    // listed devices will show a warning color when percentage hits this value
    dangerSize: 80,

    // path used to store image thumbnails
    thumbs: path.join( __dirname, '../server/storage/thumbs' ),

    // path used to store user authentication data
    users: path.join( __dirname, '../server/storage/users' ),
  },

  // -------------------------
  // thumbnail creation options
  thumbs: {

    // type of file extensions to process
    types: /^(jpe?g|png|gif|webp|svg)$/,

    // thumbnails no bigger than:
    maxWidth: 200,
    maxHeight: 100,

    // passed to sharp's jpeg() function
    jpeg: {
      quality: 60,
      chromaSubsampling: '4:4:4',
    },
  },

}

