/**
 * Reads list of local drives on the system.
 */
const os     = require( 'os' );
const exec   = require( 'child_process' ).exec;
const config = require( '../../common/config' );
const utils  = require( '../../common/utils' );

// percentage of device used that triggers a warning
const dangerSize = config.storage.dangerSize || 80;

/**
 * Parse output from wmic on windows
 */
function win32Parse( callback ) {
  exec( 'wmic logicaldisk get Caption,FreeSpace,Size,VolumeSerialNumber,VolumeName,DriveType /format:list', ( err, stdout, stderr ) => {
    let drives  = [];
    let devices = String( stdout || '' ).replace( /[\r]+/g, '' ).trim().split( '\n\n' );

    for ( let i = 0; i < devices.length; ++i ) {
      let drive = JSON.parse( '{"' + String( devices[ i ] ).trim().replace( /\n+/g, '","' ).replace( /\=/g, '":"' ) + '"}' );
      let size  = parseInt( drive.Size || 0 );
      let free  = parseInt( drive.FreeSpace || 0 );
      let used  = Number( size - free );
      let perc  = Number( parseFloat( used / ( used + free ) * 100 ).toFixed( 1 ) );

      if ( !drive.Caption || !drive.VolumeName || !drive.VolumeSerialNumber || drive.DriveType !== '3' ) continue;

      drives.push({
        id: drive.VolumeSerialNumber,
        name: drive.VolumeName,
        path: drive.Caption,
        size: utils.byteSize( size ),
        free: utils.byteSize( free ),
        perc: perc + '%',
        warn: ( perc >= dangerSize ),
      });
    }
    callback( drives );
  });
}

/**
 * Parse output from lsblk on unix
 */
function linuxParse( callback ) {
  exec( 'lsblk -bJo UUID,LABEL,SIZE,MOUNTPOINT', ( err, stdout, stderr ) => {
    let drives  = [];
    let parsed  = JSON.parse( stdout || '{}' );
    let devices = parsed.blockdevices || [];
    let plist   = [];

    for ( let i = 0; i < devices.length; ++i ) {
      let drive = devices[ i ];

      if ( !drive.uuid || !drive.label || !drive.mountpoint ) continue;

      plist.push( new Promise( resolve => {
        exec( 'df --block-size=1 --output=avail '+ drive.mountpoint, ( err, stdout, stderr ) => {
          let size  = parseInt( drive.size || 0 );
          let free  = parseInt( String( stdout ).replace( /[^0-9]+/g, '' ) || 0 );
          let used  = Number( size - free );
          let perc  = Number( parseFloat( used / ( used + free ) * 100 ).toFixed( 1 ) );

          drives.push({
            id: drive.uuid,
            name: drive.label,
            path: drive.mountpoint,
            size: utils.byteSize( size ),
            free: utils.byteSize( free ),
            perc: perc + '%',
            warn: ( perc >= dangerSize ),
          });
          resolve();
        });
      }));
    }
    Promise.all( plist ).then( () => {
      callback( drives );
    });
  });
}

/**
 * Parse output on MacOS
 */
function darwinParse( callback ) {
  let drives = [];
  // ...
  callback( drives );
}


/**
 * Get list of local hard drives on current platform
 */
module.exports = {
  getDrives( callback ) {
    switch ( os.platform().toLowerCase() ) {
      case "win32"  : win32Parse( callback );  break;
      case "linux"  : linuxParse( callback );  break;
      case "darwin" : darwinParse( callback ); break;
      default       : callback( [] );
    }
  }
}

