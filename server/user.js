/**
 * User script for managing user accounts.
 * Usage: node ./user.js <action> <username> <password>
 */
const fs     = require( 'fs-extra' );
const md5    = require( 'md5' );
const Bcrypt = require( 'bcrypt' );
const Users  = require( './modules/users' );
const config = require( '../common/config' );
const utils  = require( '../common/utils' );

// params
const action   = process.argv[2] || ''; // what to do
const userinfo = process.argv[3] || ''; // id or username depending on action
const password = process.argv[4] || ''; // plain text password to be hashed

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
  logInfo( 'Usage: ./user.js [action] [id/username] [password]' );
  logInfo( ' ' );
  logInfo( 'action: list   - List all [id] and [username] user entries.' );
  logInfo( 'action: create - Create new user entry providing a [username] and [password].' );
  logInfo( 'action: update - Update existing user entry providing an [id] and new [password].' );
  logInfo( 'action: fetch  - Load data for an user providing an [id] or [username].' );
  logInfo( 'action: delete - Delete existing user entry providing an [id].' );
  logInfo( 'action: flush  - Remove all user entries from database.' );
  logger( ' ' );
};

// list all users
const listUsers = () => {
  logHeader();
  logInfo( 'Listing all available users...' );

  Users.list( ( err, rows ) => {
    if ( err ) return logError( err.message || 'Problem listing users data.' );
    if ( !rows.length ) return logInfo( 'No user entries found.' );
    logInfo( 'Total user entries found: '+ rows.length );

    for ( let i = 0; i < rows.length; ++i ) {
      console.log( '\n', '-'.repeat( 32 ) );
      console.log( rows[ i ] );
    }
  });
};

// fetch user data
const fetchUser = ( idname ) => {
  logHeader();
  logInfo( 'Fetching user data for ('+ idname +')...' );

  if ( !idname ) return logError( 'Must provide an id or username!' );

  if ( /^([a-f0-9]{32})$/.test( idname ) ) { // md5 hash id
    return Users.fetchById( idname, ( err, data ) => {
      if ( err ) return logError( err.message || 'Problem finding user entry by id ('+ idname +').' );
      if ( !data ) return logError( 'Could not find user by id ('+ idname +').' );
      logSuccess( 'User data for ('+ data.username +'):' );
      console.log( '\n', '-'.repeat( 32 ) );
      console.log( data );
    });
  }
  return Users.fetchByName( idname, ( err, data ) => {
    if ( err ) return logError( err.message || 'Problem finding user entry by username ('+ idname +').' );
    if ( !data ) return logError( 'Could not find user by username ('+ idname +').' );
    logSuccess( 'User data for ('+ data.username +'):' );
    console.log( '\n', '-'.repeat( 32 ) );
    console.log( data );
  });
};

// create or update user
const createUser = ( username, password ) => {
  logHeader();
  logInfo( 'Inserting new password for user ('+ username +')...' );

  if ( !username ) return logError( 'Must provide a username!' );
  if ( !password ) return logError( 'Must provide a new password!' );

  Bcrypt.hash( password, 10, ( err, hash ) => {
    if ( err || !hash ) return logError( err.message || 'Failed to create password hash.' );

    let now = Date.now();
    let userid = md5( utils.randString( 30 ) +'-'+ now ); // one-time unique id
    let userdata = {
      id: userid,
      created: now,
      modified: 0,
      image: '',
      name: username,
      username: username,
      password: hash.toString(),
      options: {},
    };

    Users.list( ( err, rows ) => {
      for ( let i = 0; i < rows.length; ++i ) {
        if ( rows[ i ].username === username ) {
          return logError( 'This username is already taken ('+ username +').' );
        }
      }
      Users.create( userid, userdata, ( err, data ) => {
        if ( err ) return logError( err.message || 'Failed to create new user entry for ('+ username +').' );
        logSuccess( 'Created new user account for ('+ username +').' );
      });
    });
  });
};

// update user
const updateUser = ( id, password ) => {
  logHeader();
  logInfo( 'Update existing user by id ('+ id +')...' );

  if ( !id ) return logError( 'Must provide the user id!' );
  if ( !password ) return logError( 'Must provide a new password!' );

  Bcrypt.hash( password, 10, ( err, hash ) => {
    if ( err || !hash ) return logError( err.message || 'Failed to create password hash.' );

    let newdata = {
      modified: Date.now(),
      password: hash.toString(),
    };
    Users.update( id, newdata, ( err, data ) => {
      if ( err ) return logError( err.message || 'Failed to write data to store.' );
      logSuccess( 'Updated user account for ('+ data.username +').' );
    });
  });
};

// delete user
const deleteUser = ( id ) => {
  logHeader();
  logInfo( 'Removing existing user by id ('+ id +')...' );

  if ( !id ) return logError( 'Must provide an id!' );

  Users.delete( id, ( err, status ) => {
    if ( err || !status ) return logError( err.message || 'Failed to remove user ('+ id +').' );
    logSuccess( 'Removed user ('+ id +') form database.' );
  });
};

// flush all data
const flushData = () => {
  logHeader();
  logInfo( 'Removing all users from database...' );

  Users.flush( ( err, total ) => {
    if ( err ) return logError( err.message || 'Problem flushing users data.' );
    if ( !total ) return logInfo( 'No user entries found.' );
    logInfo( 'Done, removed '+ utils.getNoun( total, 'entry', 'entries' ) +' from database.' );
  });
};

// check storage folder, create if needed
const checkStorage = () => {
  let userStore = utils.fixPath( config.storage.users );
  let storeDir  = userStore.split( '/' ).slice( 0, -1 ).join( '/' );

  fs.ensureDir( storeDir, err => {
    if ( err ) {
      logError( 'Could not create app storage folder: '+ storeDir );
      logError( 'This folder is required for app and user data.' );
      return;
    }
    switch ( action ) {
      case 'list':   return listUsers();
      case 'create': return createUser( userinfo, password );
      case 'update': return updateUser( userinfo, password );
      case 'fetch':  return fetchUser( userinfo );
      case 'delete': return deleteUser( userinfo );
      case 'flush':  return flushData();
      default:       return logHelp();
    }
  });
}

// go
checkStorage();
