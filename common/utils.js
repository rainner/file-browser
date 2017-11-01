/**
 * Common utilities
 */
module.exports = {

  // limit characters allowed for a system file name
  stripName( name ) {
    name = String( name || '' )
      .replace( /[^\w\-\+\~\.\;\,\'\`\@\!\#\$\%\&\^\(\)\[\]\{\}]+/g, ' ' )
      .replace( /[\s]+/g, ' ' )
      .trim();
    return ( name === '.' || name === '..' ) ? '' : name;
  },

  // sanitize a path
  fixPath( path, append ) {
    append = String( append || '' );
    return String( path || '' )
      .replace( /\\/g, '/' )
      .replace( /\/\/+/g, '/' )
      .replace( /\/+$/g, '' ) + append;
  },

  // adds characters to the left of a value if it's lenght is less than a limit
  leftPad( value, limit, char ) {
    value = String( value || '' );
    char  = String( char || '0' );
    limit = limit >> 0;

    if ( value.length > limit ) {
      return value;
    }
    limit = limit - value.length;

    if ( limit > char.length ) {
      char += char.repeat( limit / char.length );
    }
    return char.slice( 0, limit ) + value;
  },

  // get readable file size from bytes
  byteSize( bytes, decimals ) {
    if ( bytes == 0 ) return '0 b';
    let k = 1024;
    let s = [ 'b', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb' ];
    let i = Math.floor( Math.log( bytes ) / Math.log( k ) );
    return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( decimals || 2 ) ) + ' ' + s[ i ];
  },

  // get date string for args, or current time
  dateString( dateStr, addTime ) {
    let output  = '';
    let date    = new Date( dateStr || Date.now() );
    let year    = date.getUTCFullYear();
    let month   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][ date.getMonth() ];
    let day     = date.getUTCDate();
    let minute  = date.getMinutes();
    let fullh   = date.getHours();
    let hour    = ( fullh > 12 ) ? ( fullh - 12 ) : fullh;
    let ampm    = ( fullh > 12 ) ? 'PM' : 'AM';
    let _p      = function( n ) { return ( n < 10 ) ? '0'+ n : ''+ n; };

    hour   = ( hour === 0 ) ? 12 : hour;
    output = month + '/' + _p( day ) + '/' + year;
    return ( addTime ) ? output + ' ' + _p( hour ) + ':' + _p( minute ) + ' ' + ampm : output;
  },

  // random string for a given length
  randString( length ) {
    let chars  = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let total  = parseInt( length ) || 10;
    let output = '';

    while ( total ) {
      output += chars.charAt( Math.floor( Math.random() * chars.length ) );
      total--;
    }
    return output;
  },

  // get a unique ID string that uses the current timestamp and a random value
  idString() {
    return ( Date.now().toString( 36 ) + Math.random().toString( 36 ).substr( 2, 5 ) ).toUpperCase();
  },

  // get a alphanumeric version of a string
  keyString( str ) {
    return String( str || '' ).trim().replace( /[^\w]+/g, '_' );
  },

  // build noun from a number
  getNoun( count, singular, plutal ) {
    return count + ' ' + ( ( count === 1 ) ? singular : plutal );
  },

}
