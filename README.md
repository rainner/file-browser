[twitter]: http://twitter.com/raintek_
[mit]: http://www.opensource.org/licenses/mit-license.php
[vue]: https://github.com/vuejs/vue
[hapi]: https://github.com/hapijs/hapi
[levelup]: https://github.com/Level/levelup
[sharp]: https://github.com/lovell/sharp
[mdb]: https://www.themoviedb.org/
[node]: https://nodejs.org/

# FileBrowser SPA

![File-Browser](https://raw.githubusercontent.com/rainner/file-browser/master/thumb.jpg)

This is a single page web app built with Vue.js and served by Hapi.js running on Node.js on the backend, intended to be used as a system file browser similar to Finder or Explorer. Some of the features of this file browser web app include:

  - Fast and reactive, powered by [Vue][vue].
  - Session/Cookie user authentication with [Hapi][hapi].
  - Tested to work on both Windows and Linux environments.
  - Automatically scan system for local attached devices.
  - Save device locations to favorite with LocalStorage.
  - Support for image thumbnail with [Sharp][sharp] using data urls.
  - Fast app, cache and user data storage with [Levelup][levelup].
  - Integrated [TheMovieDb][mdb] API support for renaming video files.
  - Batch operation on multiple selected files (Move/Delete).
  - Cleanup options for deleting or renaming multiple files at once.
  - Drag/drop multi-file upload to current selected location on a device.
  - Small footprint.

### Installation

This app makes use of Async/Await on the backend which requires [Node][node] version 7.6+. Some of the other app dependencies requires compilers to build it's code (c++, gcc, msvs, etc) depending on your OS.

After cloning this, you should probably rename the example config file included and make any changes to it before moving on. Rename file `/common/config.example.js` to just `/common/config.js`.

Installing the dependencies and building the bundles after install.

```sh
# install everything
$ npm install

# build app bundles with webpack
$ npm run build
```

Managing user accounts used to access the app (authentication). This will run an included script used to manage user accounts. Follow the help message and use arguments as needed.

```sh
# get the default help output
$ npm run user

# list existing users
$ npm run user list

# add a new user to the list
$ npm run user create Bob l337p4$$
```

Running the app.

```sh
# start with node
$ npm run node

# start with nodemon
$ npm run nodemon

# start with pm2
$ npm run pm2
```

### Todos

 - Write Tests
 - Add Night Mode

### Author

Rainner Lins: [@raintek_][twitter]

### License

Licensed under [MIT][mit].
