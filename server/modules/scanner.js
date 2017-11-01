/**
 * Scans a directory tree for files or folders
 */
const fs   = require( 'fs' );
const path = require( 'path' );

class Scanner {

  // recursive scan all files within a path
  scanFiles( dir, callback ) {
    fs.readdirSync( dir ).forEach( ( name ) => {
      let fpath = path.join( dir, name );
      let stats = fs.statSync( fpath );

      if ( stats.isDirectory() ) {
        this.scanFiles( fpath, callback );
      } else if ( stats.isFile() ) {
        callback( fpath, stats );
      }
    });
  }

  // recursive scan for empty folders within a path
  scanEmptyFolders( dir, callback ) {
    fs.readdirSync( dir ).forEach( ( name ) => {
      let fpath = path.join( dir, name );
      let stats = fs.statSync( fpath );

      if ( stats.isDirectory() ) {
        if ( fs.readdirSync( fpath ).length ) {
          this.scanEmptyFolders( fpath, callback );
        } else {
          callback( fpath, stats );
        }
      }
    });
  }

};

module.exports = new Scanner();
