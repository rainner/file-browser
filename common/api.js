/**
 * Backend API endpoints
 */
const base = '';

export default {

  // user auth routes
  user: base + '/user',
  login: base + '/login',
  logout: base + '/logout',

  // devices and folder listings
  devices: base + '/devices',
  listing: base + '/listing',

  // folder/file process
  info: base + '/info',
  create: base + '/create',
  move: base + '/move',
  copy: base + '/copy',
  delete: base + '/delete',
  batch: base + '/batch',

  // file transfers
  upload: base + '/upload',
  open: base + '/open',
  download: base + '/download',
  thumbs: base + '/thumbs',

  // movie API data
  movieSearch: base + '/movie-search',
  movieInfo: base + '/movie-info',

  // tv API data
  tvSearch: base + '/tv-search',
  tvSeason: base + '/tv-season',
  tvEpisode: base + '/tv-episode',

  // maintenance
  cleanNames: base + '/clean-names',
  cleanThumbs: base + '/clean-thumbs',
  cleanJunk: base + '/clean-junk',
}
