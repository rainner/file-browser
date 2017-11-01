/**
 * Stat an item and get info about it
 */
const fs     = require( 'fs' );
const md5    = require( 'md5' );
const mime   = require( 'mime' );
const utils  = require( '../../common/utils' );

const iconClass = ( type ) => {
  switch ( type ) {
    case 'folder'      : return 'icon-folder';
    case 'audio'       : return 'icon-audio';
    case 'video'       : return 'icon-movie';
    case 'image'       : return 'icon-image';
    case 'text'        : return 'icon-edit';
    case 'executable'  : return 'icon-puzzle';
    case 'package'     : return 'icon-file-zip';
    case 'application' : return 'icon-file-code';
    default            : return 'icon-file';
  }
};

module.exports = ( target, store ) => {

  return new Promise( resolve => {
    target = utils.fixPath( target );

    fs.stat( target, ( err, stats ) => {
      if ( err ) return resolve();

      let isdir = stats.isDirectory();
      let name  = target.split( '/' ).pop();
      let item  = {
        selected: false,
        protected: ( /^(\.|\$|desktop\.ini|thumbs\.db)/i.test( name ) ),
        parent: target.split( '/' ).slice( 0, -1 ).join( '/' ),
        path: target,
        name: name,
        type: isdir ? 'folder' : 'file',
        extension: '',
        size: '',
        created: utils.dateString( stats.birthtime || Date.now() ),
        modified: utils.dateString( stats.mtime || stats.birthtime || Date.now() ),
        icon: isdir ? 'icon-folder' : 'icon-file',
        thumbnail: '',
        stats: stats,
      };

      // resolve items count within folder
      if ( item.type === 'folder' ) {
        return fs.readdir( target, {}, ( err, list ) => {
          list = list || [];
          item.size = utils.getNoun( list.length, 'item', 'items' );
          resolve( item );
        });
      }

      // resolve file
      if ( item.type === 'file' ) {
        item.size = utils.byteSize( parseInt( stats.size || 0 ) );

        // resolve file extension and type from mime
        if ( /\.[\w\-]+$/.test( name ) ) {
          item.extension = name.split( '.' ).pop().toLowerCase();
          item.type = String( mime.getType( item.extension ) || '' ).split( '/' ).shift();
          item.type = /^(audio|video|image|text|application)$/i.test( item.type ) ? item.type : 'file';
        }
        // try to resolve file types based on extension
        if ( item.extension ) {
          item.type = /^(jsx|vue)$/i.test( item.extension ) ? 'application' : item.type;
          item.type = /^(json|xml|ini|info|nfo|cnf|config|lst|list)$/i.test( item.extension ) ? 'text' : item.type;
          item.type = /^(exe|apk|app|ipa|k?sh|py|cpl|msi|msp|msc|mst|cmd|bat|reg|rgs|run|out|job|paf|pif|vb|vbe|vbs|ws|wsf|wsh)$/i.test( item.extension ) ? 'executable' : item.type;
          item.type = /^(ar?|lbr|iso|dmg|mar|rar|sda|jar|pak|zipx?|s?7z|zz|gz|lz|rz|sz|xz|shar|bz2|ace|arc|cab|car)$/i.test( item.extension ) ? 'package' : item.type;
        }
        // resolve icon after resolving type
        item.icon = iconClass( item.type );

        // check if thumb image for this file exists in cache/db
        if ( item.type === 'image' && store ) {
          return store.get( md5( target ), ( err, thumb ) => {
            item.thumbnail = String( thumb || '' );
            resolve( item );
          });
        }
        // all done here
        resolve( item );
      }
    });
  });
}
