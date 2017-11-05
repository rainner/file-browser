/**
 * Manage user store data
 */
const levelup   = require( 'levelup' );
const leveldown = require( 'leveldown' );
const config    = require( '../../common/config' );
const store     = levelup( leveldown( config.storage.users ) );

module.exports = {

  // list all used in store
  list( callback ) {
    let rows = [];
    return store.createReadStream()
    .on( 'data', data => { rows.push( JSON.parse( data.value.toString() ) ); } )
    .on( 'error', err => { callback( err, rows ); } )
    .on( 'end', () => { callback( null, rows ); } );
  },

  // fetch user entry by id
  fetchById( id, callback ) {
    return store.get( id, ( err, data ) => {
      if ( err || !data ) return callback( err );
      callback( null, JSON.parse( data.toString() ) );
    });
  },

  // fetch user entry by username
  fetchByName( username, callback ) {
    return this.list( ( err, rows ) => {
      if ( err ) return callback( err ); // error

      for ( let i = 0; i < rows.length; ++i ) {
        if ( rows[ i ].username === username ) {
          return callback( null, rows[ i ] ); // found
        }
      }
      return callback( null, null ); // not found
    });
  },

  // create new user entry
  create( id, data, callback ) {
    return store.put( id, JSON.stringify( data ), err => {
      if ( err ) return callback( err );
      callback( null, data );
    });
  },

  // update data for existing user entry
  update( id, newdata, callback ) {
    return store.get( id, ( err, data ) => {
      if ( err || !data ) return callback( err );
      data = JSON.parse( data.toString() );
      data = Object.assign( {}, data, newdata );
      store.put( id, JSON.stringify( data ), err => {
        if ( err ) return callback( err );
        callback( null, data );
      });
    });
  },

  // delete user entry by id
  delete( id, callback ) {
    return store.del( id, err => {
      if ( err ) return callback( err );
      callback( null, true );
    });
  },

  // flush all user data from store
  flush( callback ) {
    let plist = [];
    return store.createReadStream()
    .on( 'data', data => { plist.push( store.del( data.key ) ); } )
    .on( 'error', err => { callback( err ); } )
    .on( 'end', () => {
      Promise.all( plist )
        .then( () => { callback( null, plist.length ); } )
        .catch( err => { callback( err ); } );
    });
  },

};
