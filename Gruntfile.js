/**
  @fileoverview main Grunt task file
**/
'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    //dust compilation
    dust: {
      defaults: {
        files: [
          {
            expand: true,
            cwd: "views/client/",
            src: ["**/*.dust"],
            dest: "public/templates/",
            ext: ".js"
          }
        ],
        options: {
          wrapper: false,
          relative: true
        }
      },
    },

    //watch
    watch: {
      options:{
        livereload: true
      },
      client: {
        files: ['public/**/*.js'],
        options: {
          interrupt: true
        },
      },
      dust: {
        files: ['views/client/**/*.dust'],
        tasks: ["dust"],
        options: {
          interrupt: true
        },
      },
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['watch']);

  //npm tasks

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-dust');

};
