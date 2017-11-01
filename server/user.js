/**
 * User script for managing user accounts.
 * Usage: node ./user.js <action> <username> <password>
 */
const levelup   = require( 'levelup' );
const leveldown = require( 'leveldown' );
const Bcrypt    = require( 'bcrypt' );
const config    = require( '../common/config' );

// params
const action   = process.argv[2] || '';
const username = process.argv[3] || '';
const password = process.argv[4] || '';

// log messages
const logger = ( message ) => {
  console.log( message );
};

// log error message
const logError = ( message ) => {
  logger( '[!] '+ message );
};

// log info message
const logInfo = ( message ) => {
  logger( '[-] '+ message );
};

// log error message
const logSuccess = ( message ) => {
  logger( '[+] '+ message );
};

// log header message
const logHeader = () => {
  logger( ' ' );
  logger( '-'.repeat( 50 ) );
  logInfo( 'Welcome to the user manager script.' );
};

// log help message
const logHelp = () => {
  logHeader();
  logInfo( 'Usage: ./user.js [action] [username] [password]' );
  logInfo( ' ' );
  logInfo( 'action: list   - List all [username] entries.' );
  logInfo( 'action: create - Create or Update [username]/[password] entry.' );
  logInfo( 'action: delete - Delete existing [username] entry.' );
  logInfo( 'action: flush  - Remove all [username] entries.' );
  logger( ' ' );
};

// list all users
const listUsers = () => {
  logHeader();
  logInfo( 'Listing all available users...' );

  let store = levelup( leveldown( config.storage.users ) );
  let list  = [];

  store.createReadStream()
  .on( 'data', data => { list.push( data.key +' : '+ data.value ); })
  .on( 'end', () => {
    store.close();
    if ( !list.length ) return logInfo( 'No entries found.' );
    logInfo( 'Total entries found: '+ list.length );
    for ( let i = 0; i < list.length; ++i ) logSuccess( list[ i ] );
  });
};

// create or update user
const createUser = ( username, password ) => {
  logHeader();
  logInfo( 'Inserting new password for user ('+ username +')...' );

  if ( !username ) {
    return logError( 'Must provide a username!' );
  }
  if ( !password ) {
    return logError( 'Must provide a new password!' );
  }
  Bcrypt.hash( password, 10, ( err, pw_hash ) => {
    if ( err || !pw_hash ) {
      return logError( err.message || 'Failed to create password hash.' );
    }
    let store = levelup( leveldown( config.storage.users ) );

    store.put( username, pw_hash, err => {
      store.close();
      if ( err ) return logError( err.message || 'Failed to write data to store.' );
      logSuccess( 'Inserted new password for user ('+ username +').' );
    });
  });
};

// delete user
const deleteUser = ( username ) => {
  logHeader();
  logInfo( 'Removing exinsting user ('+ username +')...' );

  if ( !username ) {
    return logError( 'Must provide a username!' );
  }
  let store = levelup( leveldown( config.storage.users ) );

  store.del( username, err => {
    store.close();
    if ( err ) return logError( err.message || 'Failed to remove user ('+ username +').' );
    logSuccess( 'Removed user ('+ username +') form database.' );
  });
};

// flush all data
const flushData = () => {
  logHeader();
  logInfo( 'Removing all users from database...' );

  let store = levelup( leveldown( config.storage.users ) );
  let plist = [];

  store.createReadStream()
  .on( 'data', data => {
    plist.push( store.del( data.key ) );
  })
  .on( 'end', () => {
    Promise.all( plist ).then( () => {
      store.close();
      logInfo( 'Done.' );
    });
  });
};

// process args
switch ( action ) {
  case 'list':   return listUsers();
  case 'create': return createUser( username, password );
  case 'delete': return deleteUser( username );
  case 'flush':  return flushData();
  default:       return logHelp();
}
