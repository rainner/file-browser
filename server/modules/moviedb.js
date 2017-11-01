/**
 * Class for talking with The Movie DB API.
 * https://developers.themoviedb.org/3/getting-started
 */
const https = require( 'https' );

// class export
module.exports = class MovieDB {

  // se the local API data
  constructor( apiKey ) {
    this._apiurl = 'https://api.themoviedb.org/3';
    this._apikey = apiKey;
  }

  // search for a movie by name
  searchMovie( name, callback ) {
    let url = this._getUrl( '/search/movie', { query: name } );
    this._fetchData( url, callback );
  }

  // search for TV show by name
  searchShow( name, callback ) {
    let url = this._getUrl( '/search/tv', { query: name } );
    this._fetchData( url, callback );
  }

  // fetch data for a movie by id number
  fetchMovieInfo( id, callback ) {
    let url = this._getUrl( '/movie/'+ id, {} );
    this._fetchData( url, callback );
  }

  // fetch list of episodes for a tv show season by id number
  fetchShowSeason( id, season, callback ) {
    let url = this._getUrl( '/tv/'+ id +'/season/'+ season, {} );
    this._fetchData( url, callback );
  }

  // fetch data for a single tv show episode by id number
  fetchShowEpisode( id, season, episode, callback ) {
    let url = this._getUrl( '/tv/'+ id +'/season/'+ season +'/episode/'+ episode, {} );
    this._fetchData( url, callback );
  }

  // build api url
  _getUrl( route, query ) {
    route = String( route || '' );
    query = Object.assign( {}, query, { api_key: this._apikey } );
    let pairs = [];

    for ( let key in query ) {
      if ( query.hasOwnProperty( key ) ) {
        pairs.push( key + '=' + encodeURIComponent( query[ key ] ) );
      }
    }
    return this._apiurl + route + '?' + pairs.join( '&' );
  }

  // fetch data from api
  _fetchData( url, callback ) {
    https.get( url, res => {
      let body = '';
      let data = null;

      res.setEncoding( 'utf8' );
      res.on( 'data', ( data ) => { body += data; } );
      res.on( 'end', () => {

        try { data = JSON.parse( body ); }
        catch ( e ) { return callback( 'Error parsing the API response body.' ); }

        if ( data.status_message ) {
          return callback( data.status_message );
        }
        callback( null, data );
      });
    });

  }
}
