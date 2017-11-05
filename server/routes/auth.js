/**
 * User authentication routes
 */
const Joi     = require( 'joi' );
const Bcrypt  = require( 'bcrypt' );
const Boom    = require( 'boom' );
const Success = require( '../modules/success' );
const Users   = require( '../modules/users' );
const config  = require( '../../common/config' );
const utils   = require( '../../common/utils' );
const routes  = [];

// wrapper for modifying user data after login or update
const fixUserData = ( data ) => {
  if ( data.password ) delete data.password;
  return Object.assign( data, {
    login_time: Date.now(),
    login_duration: config.session.duration,
  });
};

// helper for updating user data
const updateUserData = ( id, newdata, request, reply ) => {
  Users.update( id, newdata, ( err, userdata ) => {
    if ( err ) return reply( Boom.badImplementation( err ) );
    userdata = fixUserData( userdata ); // filter data
    request.cookieAuth.set( userdata ); // update login data
    reply( Success( 200, 'User data saved successfully.', userdata ) );
  });
};

/**
 * Get client loggin status and data.
 * @return {object}: HTTP response object with data
 */
routes.push({
  method: 'GET',
  path: '/user',
  config: {
    auth: { mode: 'try' },
    handler: ( request, reply ) => {
      let auth     = request.auth || {};
      let loggedin = auth.isAuthenticated || false;
      let userdata = auth.credentials || {};
      return reply( Success( 200, 'Status', { loggedin, userdata } ) );
    }
  }
});

/**
 * save user account data.
 * @string {id}: User id
 * @string {data}: New data to be merged
 * @return {object}: HTTP response object with user ata
 */
routes.push({
  method: 'POST',
  path: '/user',
  config: {
    validate: {
      payload: {
        id: Joi.string().min( 32 ).max( 32 ).required(),
        data: Joi.object().required(),
      }
    },
    handler: ( request, reply ) => {
      let id      = request.payload.id;
      let data    = request.payload.data;
      let newdata = {};

      if ( !id || !data.name || !data.username ) {
        return reply( Boom.badRequest( 'Account id, name and username are required.' ) );
      }
      newdata.modified = Date.now();
      newdata.name     = data.name;
      newdata.username = data.username;

      if ( data.password ) {
        return Bcrypt.hash( data.password, 10, ( err, hash ) => {
          if ( err || !hash ) return reply( Boom.badImplementation( err ) );
          newdata.password = hash.toString();
          updateUserData( id, newdata, request, reply );
        });
      }
      updateUserData( id, newdata, request, reply );
    }
  }
});

/**
 * Authenticate login request
 * @string {username}: User name
 * @string {password}: Account password
 * @return {object}: HTTP response object with user data
 */
routes.push({
  method: 'POST',
  path: '/login',
  config: {
    auth: false,
    validate: {
      payload: {
        username: Joi.string().min( 3 ).max( 30 ).required(),
        password: Joi.string().min( 6 ).max( 200 ).required(),
      }
    },
    handler: ( request, reply ) => {
      let username = request.payload.username;
      let pw_plain = request.payload.password;

      Users.fetchByName( username, ( err, data ) => {
        if ( err ) return reply( Boom.unauthorized( 'Account could not be found.' ) );
        if ( !data ) return reply( Boom.unauthorized( 'Account could not be found.' ) );

        Bcrypt.compare( pw_plain, data.password, ( err, isValid ) => {
          if ( err || !isValid ) return reply( Boom.unauthorized( 'Incorrect username or password.' ) );
          data = fixUserData( data );
          request.cookieAuth.set( data );
          reply( Success( 200, 'Login successful.', data ) );
        });
      });
    }
  }
});

/**
 * Clear session and return to login page.
 * @return {object}: HTTP response object with data
 */
routes.push({
  method: 'GET',
  path: '/logout',
  config: {
    auth: { mode: 'try' },
    handler: ( request, reply ) => {
      request.cookieAuth.clear();
      return reply( Success( 200, 'Session terminated successfully.' ) );
    }
  }
});

// export routes
module.exports = routes;
