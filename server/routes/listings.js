/**
 * Folder listings
 */
const fs        = require( 'fs-extra' );
const levelup   = require( 'levelup' );
const leveldown = require( 'leveldown' );
const Boom      = require( 'boom' );
const Success   = require( '../modules/success' );
const Stat      = require( '../modules/stat' );
const config    = require( '../../common/config' );
const utils     = require( '../../common/utils' );

/**
 * List items from a folder path.
 * @string {path}: Full path to a folder on a device to be listed
 * @return {object}: HTTP response object with data list
 */
module.exports = {
  method: 'POST',
  path: '/listing',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.path ) {
        return reply( Boom.badRequest( 'Must provide a folder path.' ) );
      }
      let target  = utils.fixPath( p.path, '/' );
      let store   = levelup( leveldown( config.storage.thumbs ) );
      let folders = [];
      let files   = [];
      let plist   = [];

      fs.readdir( target, {}, ( err, list ) => {
        if ( err ) return reply( Boom.badImplementation( err ) );

        for ( let item of list ) {
          plist.push( Stat( target + item, store ) );
        }
        Promise.all( plist ).then( items => {
          for ( let i = 0; i < items.length; ++i ) {
            if ( !items[ i ] ) continue;
            if ( items[ i ].type === 'folder' ) { folders.push( items[ i ] ); }
            else { files.push( items[ i ] ); }
          }
          store.close();
          return reply( Success( 200, 'Success', [].concat( folders, files ) ) );
        });
      });
    }
  }
};
