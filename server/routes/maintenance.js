/**
 * Common fs maintenance
 */
const fs      = require( 'fs-extra' );
const mime    = require( 'mime' );
const Boom    = require( 'boom' );
const Scanner = require( '../modules/scanner' );
const Success = require( '../modules/success' );
const config  = require( '../../common/config' );
const utils   = require( '../../common/utils' );
const routes  = [];

// 1:1 map of regular expressions to test for incoming request params
const reglist = {
  hidden_files  : /^\.(DS_Store|AppleDouble|LSOverride|Trashes).*$|^Desktop\.ini$/,
  thumb_files   : /^\._.*$|^Icon\r$|^(Thumbs|ehthumbs)\.db$|^(folder|Album|Cover|banner).*\.jpg$/,
  cache_files   : /^\..*\.swp$|~$/,
  torrent_files : /\.torrent$/,
  log_files     : /\.log$/,
};

/**
 * Rename child files of given path with incoming options
 */
routes.push({
  method: 'POST',
  path: '/clean-names',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.path ) {
        return reply( Boom.badRequest( 'Must provide a folder path.' ) );
      }
      let fpath = utils.fixPath( p.path );
      let count = 0;

      // scan for files...
      fs.readdirSync( fpath ).forEach( ( name ) => {
        let filePath  = fpath +'/'+ name;
        let fileStats = fs.statSync( filePath );

        if ( fileStats.isFile() ) {

          // resolve date info for current file
          let date  = new Date( fileStats.birthtime || null );
          let month = utils.leftPad( date.getMonth() + 1, 2, '0' );
          let day   = utils.leftPad( date.getDate(), 2, '0' );
          let year  = date.getFullYear();

          // file name options from client
          let pre = String( request.payload.name_prefix || '' ).trim();
          let suf = String( request.payload.name_suffix || '' ).trim();
          let sep = String( request.payload.name_separator || '_' );

          // resolve file extension, type, name and path
          let randStr  = utils.randString( 10 );
          let fileExt  = name.split( '.' ).pop().toLowerCase();
          let fileType = String( mime.getType( fileExt ) || 'file/file' ).split( '/' ).shift();
          let newPath  = fpath;
          let newName  = [];

          if ( pre ) newName.push( pre );
          newName.push( fileType );
          newName.push( year );
          newName.push( month );
          newName.push( day );
          newName.push( randStr );
          if ( suf ) newName.push( suf );

          // final file name
          newName = newName.join( sep ) +'.'+ fileExt;

          // create type subfolder
          if ( request.payload.sub_type ) {
            newPath += '/'+ fileType;
          }
          // create year subfolder
          if ( request.payload.sub_year ) {
            newPath += '/'+ year;
          }
          // create extension subfolder
          if ( request.payload.sub_extension ) {
            newPath += '/'+ fileExt;
          }
          // final file path
          newPath += '/'+ newName;

          // move/rename
          fs.moveSync( filePath, newPath, { overwrite: true } );
          if ( fs.existsSync( newPath ) ) count++;
        }
      });
      return reply( Success( 200, 'Done, '+ utils.getNoun( count, 'file', 'files' ) +' renamed.' ) );
    }
  }
});

/**
 * Recursive clean files within a root path based on incoming options
 */
routes.push({
  method: 'POST',
  path: '/clean-junk',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.path ) {
        return reply( Boom.badRequest( 'Must provide a folder path.' ) );
      }
      let fpath = utils.fixPath( p.path );
      let count = 0;

      // delete empty folders
      if ( request.payload.empty_folders ) {
        Scanner.scanEmptyFolders( fpath, ( item, stats ) => {
          fs.removeSync( item );
          if ( !fs.existsSync( item ) ) count++;
        });
      }
      // scan all sub-files and check against reglist defined at the top
      Scanner.scanFiles( fpath, ( item, stats ) => {
        let name = path.basename( item );
        Object.keys( reglist ).forEach( ( key ) => {
          if ( request.payload[ key ] && reglist[ key ].test( name ) ) {
            fs.removeSync( item );
            if ( !fs.existsSync( item ) ) count++;
          }
        });
      });
      return reply( Success( 200, 'Done, '+ utils.getNoun( count, 'item', 'items' ) +' deleted.' ) );
    }
  }
});

/**
 * Delete thumbnail data managed by this app
 */
routes.push({
  method: 'POST',
  path: '/clean-thumbs',
  config: {
    handler: ( request, reply ) => {

      fs.remove( config.storage.thumbs, err => {
        if ( err ) return reply( Boom.badImplementation( err ) );
        return reply( Success( 200, 'Thumbnail database cache has been deleted.' ) );
      })
    }
  }
});

// export routes
module.exports = routes;
