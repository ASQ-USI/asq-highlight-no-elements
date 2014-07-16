/**
  @fileoverview main Grunt task file
**/
'use strict';

require('dustjs-linkedin')
  .optimizers.format = function(ctx, node) {
  return node;
};

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    //dust compilation
    dust: {
      defaults: {
        files:{
          "public/templates/templates.js" : "views/client/*.dust"
        },
        options: {
          runtime : false,
          wrapper: false,
          relative: true,
          useBaseName: true,
          optimizers: {
            format: function(ctx, node) { return node; }
          }
        }
      },
    },

    //less task
    less: {
      development: {
        options: {
          paths: ["public/less"]
        },
        files: {
          "public/css/highlight.css": "public/less/highlight.less",
          "public/css/style.css": "public/less/style.less"
        }
      },
      production: {
        options: {
          paths: ["public/less"],
          yuicompress: true
        },
        files: {
          "public/css/highlight.css": "public/less/highlight.less",
          "public/css/style.css": "public/less/style.less"
        }
      }
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
      less: {
        files: ['public/**/*.less'],
        tasks: ['less:development'],
        options: {
          livereload: true,
          interrupt: true
        },
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['watch']);

  //npm tasks
  require('load-grunt-tasks')(grunt);

};
