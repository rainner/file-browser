/**
 * User authentication routes
 */
const levelup   = require( 'levelup' );
const leveldown = require( 'leveldown' );
const Joi       = require( 'joi' );
const Bcrypt    = require( 'bcrypt' );
const Boom      = require( 'boom' );
const Success   = require( '../modules/success' );
const config    = require( '../../common/config' );
const utils     = require( '../../common/utils' );
const routes    = [];

/**
 * Main app route
 * @return {html}: app template and bundles
 */
routes.push({
  method: 'GET',
  path: '/',
  config: {
    auth: false,
    handler: ( request, reply ) => {
      return reply.file( 'template.html' );
    }
  }
});

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

/**
 * Authenticate login request
 * @return {object}: HTTP response object with status
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
      let store    = levelup( leveldown( config.storage.users ) );
      let userdata = {
        name: username,
        login_time: Date.now(),
        login_duration: config.session.duration,
      };

      store.get( username, ( err, pw_hash ) => {
        store.close();

        if ( err || !pw_hash ) {
          return reply( Boom.unauthorized( 'Invalid user or password.' ) );
        }
        Bcrypt.compare( pw_plain, pw_hash.toString(), ( err, isValid ) => {
          if ( err || !isValid ) {
            return reply( Boom.unauthorized( 'Incorrect username or password.' ) );
          }
          try { request.cookieAuth.set( userdata ); }
          catch ( e ) {
            console.log( e );
            return reply( Boom.unauthorized( e ) );
          }
          return reply( Success( 200, 'Login successful.', userdata ) );
        });
      });
    }
  }
});

// export routes
module.exports = routes;
