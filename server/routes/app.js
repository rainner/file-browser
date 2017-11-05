/**
 * App static routes
 */
const routes = [];

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

// export routes
module.exports = routes;
