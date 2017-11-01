/**
 * Get devices data from OS
 */
const drives  = require( '../modules/drives' );
const Success = require( '../modules/success' );
const Boom    = require( 'boom' );
const routes  = [];

/**
 * List OS local storage devices (drives)
 * @return {object}: HTTP response object with data list
 */
routes.push({
  method: 'GET',
  path: '/devices',
  config: {
    handler: ( request, reply ) => {

      return drives.getDrives( drives => {
        if ( !drives.length ) {
          return reply( Boom.notFound( 'Could not read list of devices from the system.' ) );
        }
        return reply( Success( 200, 'Success', drives ) );
      });
    }
  }
});

// export routes
module.exports = routes;
