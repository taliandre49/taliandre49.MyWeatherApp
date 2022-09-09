'use babel';

export default {

  activate(state) {
    // replace the example argument 'linter-ruby' with the name of this Atom package
    require('atom-package-deps').install('cornell-info1300')
    .then(function() {
      console.log('All dependencies installed, good to go')
    })
  },

  deactivate() {
  },

  serialize() {
  }

};
