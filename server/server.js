/**
 * Web server
 */
const fs     = require( 'fs' );
const Path   = require( 'path' );
const Hapi   = require( 'hapi' );
const Cookie = require( 'hapi-auth-cookie' );
const Inert  = require( 'inert' );
const config = require( '../common/config' );

const serverInfo = config.mainServer;

/**
 * Hapi server
 */
const server = new Hapi.Server({
  // debug: false,
});

/**
 * Connection options
 */
server.connection({
  host: serverInfo.host,
  port: process.argv[2] || serverInfo.port || 3000,
  router: {
    stripTrailingSlash: true
  },
  routes: {
    files: {
      relativeTo: serverInfo.views,
    }
  }
});

/**
 * Pre-response event handler
 */
server.ext( 'onPreResponse', ( request, reply ) => {
  let response = request.response.isBoom ? request.response.output : request.response;
  let output   = '-'.repeat( 50 ) +'\n'+ request.method.toUpperCase() +' '+ request.path +'\n';

  // log info about the request
  for ( let name in request.headers ) {
    if ( !request.headers.hasOwnProperty( name ) ) continue;
    output += ' > '+ name +': '+ request.headers[ name ] +'\n';
  }
  // set CORS headers for OPTIONS request
  if ( request.headers.origin ) {
    response.headers['access-control-allow-origin'] = request.headers.origin;
    response.headers['access-control-allow-credentials'] = 'true';

    if ( request.method === 'options' ) {
      response.statusCode = 200;
      response.headers['access-control-expose-headers'] = 'content-type, content-length, etag';
      response.headers['access-control-max-age'] = 60 * 10;

      if ( request.headers['access-control-request-headers'] ) {
        response.headers['access-control-allow-headers'] = request.headers['access-control-request-headers'];
      }
      if ( request.headers['access-control-request-method'] ) {
        response.headers['access-control-allow-methods'] = request.headers['access-control-request-method'];
      }
    }
  }
  // done
  console.log( '\n', output, '\n', request.payload || 'No payload data.' );
  reply.continue();
});

/**
 * Load custom routes from a path
 */
const setupRoutes = () => {
  return new Promise( resolve => {

    // setup cookie auth options
    server.auth.strategy( 'session', 'cookie', {
      cookie: config.session.name,
      ttl: config.session.duration,
      password: config.keys.crypt,
      isSecure: false,
    });

    // default auth strategy
    server.auth.default({
      strategy: 'session',
      mode: 'required',
    });

    // common static files handler with Inert
    server.route({
      method: 'GET',
      path: '/{param*}',
      config: {
        auth: false,
        handler: {
          directory: {
            path: serverInfo.public,
            redirectToSlash: true,
            listing: false,
          }
        }
      }
    });

    // look for route files
    fs.readdir( serverInfo.routes, {}, ( err, list ) => {
      if ( err ) throw err;
      let routesList = [];

      // add all routes found into single array
      for ( let file of list ) {
        if ( !/\.js$/.test( file ) ) continue;
        let data = require( Path.join( serverInfo.routes, file ) );

        if ( Array.isArray( data ) ) {
          for ( let route of data ) routesList.push( route );
        }
        else if ( typeof data === 'object' ) {
          routesList.push( data );
        }
      }

      // check and register all routes
      for ( let i = 0; i < routesList.length; ++i ) {
        let r = routesList[ i ];
        r.config = r.config || {};

        // default payload type if not specified all by GET, HEAD methods
        if ( !/get|head/i.test( r.method ) && !r.config.payload ) {
          r.config.payload = { output: 'data', parse: true };
        }
        // move handler into config object
        if ( typeof r.handler === 'function' ) {
          r.config.handler = r.handler;
          r.handler = false;
        }
        // register route
        console.log( 'Registering route for:', r.method, r.path );
        server.route( r );
      }

      resolve();
    });
  });
};

/**
 * Register plugins and start the server when all is ready
 */
const initServer = async () => {
  try {
    await server.register( Cookie );
    await server.register( Inert );
    await setupRoutes();
    await server.start();
    console.log( `Server running at: ${server.info.uri}` );
  }
  catch( e ) {
    console.log( e );
  }
};

/**
 * Start
 */
initServer();

