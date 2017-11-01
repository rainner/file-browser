/**
 * Ajax Class.
 * Handles client/server communication over AJAX requests.
 */
export default class Ajax {

  // constructor
  constructor( method, endpoint, options ) {

    this._options = Object.assign( {
      // custom request headers object
      headers : { 'Accept': 'application/json, text/plain, text/html, */*' },
      // xhr expected response type from server
      type : '',
      // xhr timeout value (default: 10s)
      timeout : 10000,
      // data to be sent (string, selector, object, FormData, function)
      data : null,
      // progress custom handler
      progress : null,
      // success custom handler
      success : null,
      // error custom handler
      error : null,
      // cancel custom handler
      cancel : null,
      // complete custom handler
      complete : null,
      // ...
    }, options );

    this._method   = String( method || 'get' ).toUpperCase();
    this._endpoint = String( endpoint || '' );
    this._complete = false;

    this._xhr = new XMLHttpRequest();
    this._xhr.upload.addEventListener( 'progress', this._onProgress.bind( this ), false );
    this._xhr.addEventListener( 'error', this._onError.bind( this ), false );
    this._xhr.addEventListener( 'timeout', this._onTimeout.bind( this ), false );
    this._xhr.addEventListener( 'abort', this._onCancel.bind( this ), false );
    this._xhr.addEventListener( 'load', this._onLoad.bind( this ), false );
    this._send();
  }

  // check if FormData is available
  _hasFormData() {
    return ( 'FormData' in window );
  }

  // check if data is FormData object
  _isFormData( data ) {
    return ( this._hasFormData() && data instanceof FormData );
  }

  // check if data is HTMLFormElement object
  _isFormElement( data ) {
    return ( data instanceof HTMLFormElement );
  }

  // get form data object
  _getFormData( form ) {
    if ( this._hasFormData() ) {
      form = this._isFormElement( form ) ? form : document.createElement( 'form' );
      let fdata = new FormData( form );

      for ( let i = 0; i < form.elements.length; i++ ) {
        let control = form.elements[ i ];
        if ( control.name && control.type === 'checkbox' ) {
          fdata.set( control.name, control.checked ? 1 : 0 );
        }
      }
      return fdata;
    }
    return { set() {}, get() {}, has() {} };
  }

  // add a custom request header to be sent
  _setHeader( key, value ) {
    key = String( key || '' ).replace( /[^\w\-]+/gi, '' );
    if ( key ) this._options.headers[ key ] = value || '';
  }

  // encode data to be sent as URL args
  _urlEncode( obj, prefix ) {
    let str = [];
    if ( typeof obj === 'object' ) {
      for ( let key in obj ) {
        if ( obj.hasOwnProperty( key ) ) {
          let arg   = prefix ? prefix + '[' + key + ']' : key;
          let value = obj[ key ];
          let pair  = ( typeof value === 'object' ) ? this._urlEncode( value, arg ) : encodeURIComponent( arg ) + '=' + encodeURIComponent( value );
          str.push( pair );
        }
      }
    }
    return str.join( '&' );
  }

  // encode data as json string
  _jsonEncode( data ) {
    this._setHeader( 'Content-Type', 'application/json; charset=UTF-8' );

    if ( typeof data === 'object' ) {
      try {
        let output = JSON.stringify( data );
        return output;
      }
      catch ( e ) { }
    }
    return '[]';
  }

  // resolve data to be sent for request
  _resolveRequestData() {
    let data = this._options.data;

    // sending a GET request? send data as url args
    if ( this._method === 'GET' ) {
      let args = this._urlEncode( data );
      if ( args ) {
        let prefix = ( /\?.*$/.test( this._endpoint ) ) ? '&' : '?';
        this._endpoint += prefix + args;
      }
      return null;
    }
    // data is a string...
    if ( typeof data === 'string' ) {
      // is it a DOM selector? is it a form? encode it
      if ( /^([\w\-\.\#\:\ ]+)$/.test( data ) ) {
        let elm = document.querySelector( data );
        if ( elm instanceof HTMLFormElement ) {
          return this._getFormData( elm );
        }
      }
      return data;
    }
    // data is a an object
    if ( typeof data === 'object' ) {
      if ( this._isFormData( data ) ) return data;
      if ( this._isFormElement( data ) ) return this._getFormData( data );
      return this._jsonEncode( data );
    }
    // data is a function
    if ( typeof data === 'function' ) {
      let output = data.call( this, this._xhr );
      if ( this._isFormData( output ) ) return output;
      if ( this._isFormElement( output ) ) return this._getFormData( output );
      if ( typeof output === 'object' ) return this._jsonEncode( output );
      if ( typeof output === 'string' ) return output;
    }
    // all else, send nothing
    return null;
  }

  // resolve error string from a failed rersponse
  _resolveErrorText() {
    let status     = this._xhr.status || 500;
    let statusText = this._xhr.statusText || 'Error';
    let data       = this._xhr.response || '{}';

    // try to convert response data to object
    if ( typeof data === 'string' ) {
      try {
        let parsed = JSON.parse( data );
        data = parsed;
      }
      catch ( e ) { }
    }
    // pick an error message out of the response data
    if ( typeof data === 'object' ) {
      if ( data.info        && typeof data.info === 'string' )        return status +': '+ data.info;
      if ( data.message     && typeof data.message === 'string' )     return status +': '+ data.message;
      if ( data.description && typeof data.description === 'string' ) return status +': '+ data.description;
      if ( data.error       && typeof data.error === 'string' )       return status +': '+ data.error;
    }
    // pick a default error based on status code
    if ( status == 400 ) return status + ': The request could not be understood by the server due to malformed syntax ('+ this._endpoint +').';
    if ( status == 401 ) return status + ': You are not authorized to view the response of this request without authentication ('+ this._endpoint +').';
    if ( status == 403 ) return status + ': The server understood the request, but is refusing to fulfill it ('+ this._endpoint +').';
    if ( status == 404 ) return status + ': The server did not find anything matching the request route, or did not send a response ('+ this._endpoint +').';
    if ( status == 405 ) return status + ': The method specified for this request is not allowed for the current request route ('+ this._endpoint +').';
    if ( status == 408 ) return status + ': The server did not produce a response in time for the requested route ('+ this._endpoint +').';
    if ( status == 500 ) return status + ': The server encountered an unexpected condition which prevented it from fulfilling the request ('+ this._endpoint +').';
    return status + ': The request could not be completed ('+ statusText +') for the requested route ('+ this._endpoint +').';
  }

  // resolve data sent back from server for a success response
  _resolveResponseData() {
    let data = this._xhr.response || '';

    if ( typeof data === 'string' ) {
      try {
        let parsed = JSON.parse( data );
        data = parsed;
      }
      catch ( e ) { }
    }
    return data;
  }

  // final event to be triggered after everthing else has finished
  _onComplete( response ) {
    if ( typeof this._options.complete === 'function' && !this._complete ) {
      this._options.complete.call( this, this._xhr, response );
    }
    this._complete = true;
    this._xhr = null;
  }

  // trigger custom progress handler
  _onProgress( e ) {
    if ( e.lengthComputable && typeof this._options.progress === 'function' ) {
      let percent = Math.round( ( e.loaded * 100 ) / e.total );
      this._options.progress.call( this, this._xhr, percent );
    }
  }

  // trigger custom error handler
  _onError( e ) {
    if ( typeof this._options.error === 'function' ) {
      this._options.error.call( this, this._xhr, 'There was a problem communicating with the server.' );
    }
    this._onComplete( '' );
  }

  // trigger custom timeout/error handler
  _onTimeout( e ) {
    if ( typeof this._options.error === 'function' ) {
      this._options.error.call( this, this._xhr, 'The server did not send a response in time. Request aborted.' );
    }
    this._onComplete( '' );
  }

  // trigger custom cancel handler
  _onCancel( e ) {
    if ( typeof this._options.cancel === 'function' ) {
      this._options.cancel.call( this, this._xhr );
    }
    this._onComplete( '' );
  }

  // trigger custom complete handler
  _onLoad( e ) {
    let status   = this._xhr.status || 0;
    let error    = this._resolveErrorText();
    let response = this._resolveResponseData();

    if ( !status || status < 200 || status >= 400 ) {
      if ( typeof this._options.error === 'function' ) {
        this._options.error.call( this, this._xhr, error );
      }
    }
    else if ( status >= 200 && status < 400 ) {
      if ( typeof this._options.success === 'function' ) {
        this._options.success.call( this, this._xhr, response );
      }
    }
    this._onComplete( response );
  }

  // send new request
  _send() {
    // resolve data
    let data = this._resolveRequestData();

    // init request
    this._xhr.open( this._method, this._endpoint, true );
    this._setHeader( 'X-Requested-With', 'XMLHttpRequest' );

    // set expected response type based on request method
    switch ( this._method ) {
      case 'GET' : this._xhr.responseType = 'text'; break;
      default    : this._xhr.responseType = 'json';
    }
    // set expected response type from given option
    if ( this._options.type && typeof this._options.type === 'string' ) {
      this._xhr.responseType = this._options.type;
    }
    // set request timeout value from options
    if ( this._options.timeout && typeof this._options.timeout === 'number' ) {
      this._xhr.timeout = parseInt( this._options.timeout );
    }
    // add request headers
    for ( let key in this._options.headers ) {
      if ( this._options.headers.hasOwnProperty( key ) ) {
        this._xhr.setRequestHeader( key, this._options.headers[ key ] );
      }
    }
    // send request
    this._xhr.send( data );
  }
};
