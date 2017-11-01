/**
 * Handles file uploads and downloads
 */
const fs        = require( 'fs' );
const md5       = require( 'md5' );
const mime      = require( 'mime' );
const levelup   = require( 'levelup' );
const leveldown = require( 'leveldown' );
const sharp     = require( 'sharp' );
const Path      = require( 'path' );
const Boom      = require( 'boom' );
const Success   = require( '../modules/success' );
const config    = require( '../../common/config' );
const utils     = require( '../../common/utils' );
const routes    = [];

// sharp lib options
sharp.cache( false ); // don't lock original files
sharp.simd( true );   // better scaling performance on some CPUs

/**
 * Read file data from disk to be streamed
 * @string {path}: Full path to a file on a device to stream
 * @return {object}: HTTP response file data
 */
routes.push({
  method: 'GET',
  path: '/open',
  config: {
    handler: ( request, reply ) => {
      let p    = request.query || {};
      let file = utils.fixPath( p.file || '' );

      if ( !file ) return reply( Boom.badRequest( 'Must provide a file path.' ) );
      reply.file( file, { mode: 'inline', etagMethod: 'simple', confine: false } );
    }
  }
});

/**
 * Read file data from disk to be downloaded
 * @string {path}: Full path to a file on a device to downloaded
 * @return {object}: HTTP response file data
 */
routes.push({
  method: 'GET',
  path: '/download',
  config: {
    handler: ( request, reply ) => {
      let p    = request.query || {};
      let file = utils.fixPath( p.file || '' );

      if ( !file ) return reply( Boom.badRequest( 'Must provide a file path.' ) );
      reply.file( file, { mode: 'attachment', etagMethod: 'simple', confine: false } );
    }
  }
});

/**
 * Save single file being uploaded to a path
 * @string {path}: Full path to a folder on a device to save to
 * @string {file}: File form-data stream to be saved
 * @return {object}: HTTP response object with saved file name
 */
routes.push({
  method: 'POST',
  path: '/upload',
  config: {
    payload: {
      output: 'stream',
      allow: 'multipart/form-data',
      maxBytes: 1024 * 1024 * 10, // 10 Mb
      parse: true,
    },
    handler: ( request, reply ) => {
      let data = request.payload;

      if ( !data.path ) {
        return reply( Boom.badRequest( 'Must provide a folder path.' ) );
      }
      if ( !data.file || !data.file.hapi || !data.file.hapi.filename ) {
        return reply( Boom.badRequest( 'Must send a valid file to be saved.' ) );
      }
      let name  = utils.stripName( data.file.hapi.filename );
      let fpath = utils.fixPath( data.path +'/'+ name );
      let file  = fs.createWriteStream( fpath );

      file.on( 'error', ( err ) => { reply( Boom.badImplementation( err ) ) } );

      data.file.on( 'end', ( err ) => {
        if ( err ) return reply( Boom.badImplementation( err ) );
        return reply( Success( 200, 'File saved successfully', { name } ) );
      });
      data.file.pipe( file );
    }
  }
});

/**
 * Create, cache and return thumbnails for a list of items.
 * @string {list}: List that includes a path for each image to process
 * @return {object}: HTTP response object with thumb list data
 */
routes.push({
  method: 'POST',
  path: '/thumbs',
  config: {
    handler: ( request, reply ) => {
      let p    = request.payload || {};
      let list = p.list || [];

      if ( !Array.isArray( list ) || !list.length ) {
        return reply( Boom.badRequest( 'Must provide a list of image paths to be processed.' ) );
      }
      // image processing options
      let plist = [];
      let cap_w = config.thumbs.maxWidth || 200;
      let cap_h = config.thumbs.maxHeight || 100;
      let store = levelup( leveldown( config.storage.thumbs ) );

      // process image list
      for ( let i = 0; i < list.length; ++i ) {
        let item   = list[ i ];
        let target = utils.fixPath( item.path || '' );
        let ext    = target.split( '.' ).pop().toLowerCase();

        // wrap each item's process into a promise that
        // resolves to the index and a final data url string
        plist.push( new Promise( resolve => {

          fs.stat( target, ( err, stats ) => {
            if ( err ) return resolve();
            if ( !stats.isFile() ) return resolve();
            if ( !config.thumbs.types.test( ext ) ) return resolve();

            let image = sharp( target );

            image.metadata( ( err, md ) => {
              if ( err ) return resolve();
              if ( md.height > cap_h ) { image.resize( null, cap_h ); } else
              if ( md.width > cap_w )  { image.resize( cap_w, null ); }

              image.jpeg( config.thumbs.jpeg ).toBuffer( ( err, data, info ) => {
                if ( err ) return resolve();
                let thumb = 'data:image/jpeg;base64,'+ data.toString( 'base64' );
                list[ i ].thumb = thumb;
                store.put( md5( target ), thumb, err => { resolve(); } );
              });
            });
          });
        }));
      }

      // wait for all items to resolve and send final response
      Promise.all( plist ).then( () => {
        store.close();
        reply( Success( 200, 'Success.', { list } ) );
      });
    }
  }
});

// export routes
module.exports = routes;
