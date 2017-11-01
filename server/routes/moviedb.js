/**
 * Get data from remote API for files that are Movie/Show related.
 */
const fs      = require( 'fs-extra' );
const Boom    = require( 'boom' );
const Stat    = require( '../modules/stat' );
const Success = require( '../modules/success' );
const MovieDB = require( '../modules/moviedb' );
const config  = require( '../../common/config' );
const routes  = [];

// The Movie DB API handler
const tmdb = new MovieDB( config.keys.moviedb );

/**
 * Search API for movies by a given name
 */
routes.push({
  method: 'POST',
  path: '/movie-search',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.name ) {
        return reply( Boom.badRequest( 'Must provide a movie name.' ) );
      }
      tmdb.searchMovie( p.name, ( err, data ) => {
        if ( err ) return reply( Boom.badRequest( err ) );
        return reply( Success( 200, 'Success', data ) );
      });
    }
  }
});

/**
 * Get details for a single movie by ID
 */
routes.push({
  method: 'POST',
  path: '/movie-info',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.id ) {
        return reply( Boom.badRequest( 'Must provide a movie ID number.' ) );
      }
      tmdb.fetchMovieInfo( p.id, ( err, data ) => {
        if ( err ) return reply( Boom.badRequest( err ) );
        return reply( Success( 200, 'Success', data ) );
      });
    }
  }
});

/**
 * Search API for tv shows by a given name
 */
routes.push({
  method: 'POST',
  path: '/tv-search',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.name ) {
        return reply( Boom.badRequest( 'Must provide a tv show name.' ) );
      }
      tmdb.searchShow( p.name, ( err, data ) => {
        if ( err ) return reply( Boom.badRequest( err ) );
        return reply( Success( 200, 'Success', data ) );
      });
    }
  }
});

/**
 * Get episodes list for a tv show season by ID
 */
routes.push({
  method: 'POST',
  path: '/tv-season',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.id || !p.season ) {
        return reply( Boom.badRequest( 'Must provide a tv show ID and season number.' ) );
      }
      tmdb.fetchShowSeason( p.id, p.season, ( err, data ) => {
        if ( err ) return reply( Boom.badRequest( err ) );
        return reply( Success( 200, 'Success', data ) );
      });
    }
  }
});

/**
 * Get details for a single tv show episode by id, season and episode number
 */
routes.push({
  method: 'POST',
  path: '/tv-episode',
  config: {
    handler: ( request, reply ) => {
      let p = request.payload || {};

      if ( !p.id || !p.season || !p.episode ) {
        return reply( Boom.badRequest( 'Must provide a tv show ID, season and episode number.' ) );
      }
      tmdb.fetchShowEpisode( p.id, p.season, p.episode, ( err, data ) => {
        if ( err ) return reply( Boom.badRequest( err ) );
        return reply( Success( 200, 'Success', data ) );
      });
    }
  }
});

// export routes
module.exports = routes;
