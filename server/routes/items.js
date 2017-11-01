/**
 * Handles file modifications
 */
const fs        = require( 'fs-extra' );
const md5       = require( 'md5' );
const levelup   = require( 'levelup' );
const leveldown = require( 'leveldown' );
const Boom      = require( 'boom' );
const Success   = require( '../modules/success' );
const Stat      = require( '../modules/stat' );
const config    = require( '../../common/config' );
const utils     = require( '../../common/utils' );
const routes    = [];

/**
 * Get info about a folder or file.
 * @string {path}: Full path to a item on a device
 * @return {object}: HTTP response object with item data
 */
routes.push({
  method: 'POST',
  path: '/info',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.path ) {
        return reply( Boom.badRequest( 'Must provide a file path.' ) );
      }
      let store = levelup( leveldown( config.storage.thumbs ) );

      Stat( p.path, store ).then( item => {
        store.close();
        if ( !item ) return reply( Boom.notFound( 'The requested file could not be found.' ) );
        return reply( Success( 200, 'Success', item ) );
      });
    }
  }
});

/**
 * Create a new folder or file.
 * @string {path}: Target path to create the new item in
 * @return {object}: HTTP response object with status
 */
routes.push({
  method: 'POST',
  path: '/create',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.path ) {
        return reply( Boom.badRequest( 'Must provide a file or folder path to be created.' ) );
      }
      let target = utils.fixPath( p.path );

      if ( /\.[\w\-]+$/i.test( target ) ) {
        fs.ensureFile( target, err => {
          if ( err ) return reply( Boom.badImplementation( err ) );
          reply( Success( 200, 'File created successfully.' ) );
        });
      } else {
        fs.ensureDir( target, err => {
          if ( err ) return reply( Boom.badImplementation( err ) );
          reply( Success( 200, 'Folder created successfully.' ) );
        });
      }
    }
  }
});

/**
 * Copy entire folder or a file.
 * @string {path}: Full path to the folder or file to be copied
 * @return {object}: HTTP response object with status
 */
routes.push({
  method: 'POST',
  path: '/copy',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.path ) {
        return reply( Boom.badRequest( 'Must provide a file or folder path to be copied.' ) );
      }
      let target    = utils.fixPath( p.path );
      let dirname   = target.split( '/' ).slice( 0, -1 ).join( '/' );
      let basename  = target.split( '/' ).pop();
      let newpath   = dirname +'/'+ basename +'-copy';
      let type      = 'Folder';

      if ( /\.[\w\-]+$/i.test( basename ) ) {
        let extension = basename.split( '.' ).pop();
        newpath = dirname +'/'+ basename.replace( '.'+ extension, '-copy.'+ extension );
        type = 'File';
      }

      fs.copy( target, newpath, err => {
        if ( err ) return reply( Boom.badImplementation( err ) );
        reply( Success( 200, type +' copied successfully.' ) );
      });
    }
  }
});

/**
 * Rename/move a folder or file.
 * @string {path}: Full path to the folder or file to be renamed
 * @string {newpath}: Full path to the new item location/name
 * @return {object}: HTTP response object with status
 */
routes.push({
  method: 'POST',
  path: '/move',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.path || !p.newpath ) {
        return reply( Boom.badRequest( 'Must provide both the target and new path to move an item.' ) );
      }
      let target  = utils.fixPath( p.path );
      let newpath = utils.fixPath( p.newpath );
      let type    = /\.[\w\-]+$/i.test( target ) ? 'File' : 'Folder';

      fs.move( target, newpath, { overwrite: p.force || false }, err => {
        if ( err ) return reply( Boom.badImplementation( err ) );

        let store = levelup( leveldown( config.storage.thumbs ) );

        store.del( md5( target ), err => {
          store.close();
          reply( Success( 200, type +' saved successfully.' ) );
        });
      });
    }
  }
});

/**
 * Delete entire folder or a file.
 * @string {path}: Full path to the folder or file to be deleted
 * @return {object}: HTTP response object with status
 */
routes.push({
  method: 'POST',
  path: '/delete',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.path ) {
        return reply( Boom.badRequest( 'Must provide a file or folder path to be deleted.' ) );
      }
      let target = utils.fixPath( p.path );
      let type   = /\.[\w\-]+$/i.test( target ) ? 'File' : 'Folder';

      fs.remove( target, err => {
        if ( err ) return reply( Boom.badImplementation( err ) );

        let store = levelup( leveldown( config.storage.thumbs ) );

        store.del( md5( target ), err => {
          store.close();
          reply( Success( 200, type +' deleted successfully.' ) );
        });
      });
    }
  }
});

/**
 * Process a list of items.
 * @string {action}: Batch action to perform
 * @string {path}: Full path to a folder (if moving items)
 * @string {items}: List of item paths
 * @return {object}: HTTP response object with status
 */
routes.push({
  method: 'POST',
  path: '/batch',
  config: {
    handler: ( request, reply ) => {
      let p        = request.payload || {};
      let action   = p.action || '';
      let location = utils.fixPath( p.path || '' );
      let items    = p.items || [];
      let plist    = [];
      let count    = 0;

      if ( !action ) {
        return reply( Boom.badRequest( 'Must provide an action.' ) );
      }
      if ( action === 'move' && !location ) {
        return reply( Boom.badRequest( 'Must provide a new path when trying to move items.' ) );
      }
      if ( !Array.isArray( items ) || !items.length ) {
        return reply( Boom.badRequest( 'Must provide a list of items to process.' ) );
      }
      let store = levelup( leveldown( config.storage.thumbs ) );

      for ( let i = 0; i < items.length; ++i ) {
        let itempath = utils.fixPath( items[ i ] );
        let newpath  = location +'/'+ itempath.split( '/' ).pop();

        // move item to new location based on given path
        if ( action === 'move' && itempath ) {
          plist.push( new Promise( ( resolve, reject ) => {
            fs.move( itempath, newpath, { overwrite: true }, err => {
              if ( err ) return reject( err );
              store.del( md5( itempath ), err => {
                count++; resolve();
              });
            });
          }));
        }
        // delete item as is
        if ( action === 'delete' && itempath ) {
          plist.push( new Promise( ( resolve, reject ) => {
            fs.remove( itempath, err => {
              if ( err ) return reject( err );
              store.del( md5( itempath ), err => {
                count++; resolve();
              });
            });
          }));
        }
      }
      // resolve promise list and respond
      Promise.all( plist ).then( () => {
        store.close();
        reply( Success( 200, utils.getNoun( count, 'item', 'items' ) +' '+ action +'d successfully.' ) );
      })
      .catch( err => {
        store.close();
        reply( Boom.badImplementation( err ) );
      });
    }
  }
});

// export routes
module.exports = routes;
