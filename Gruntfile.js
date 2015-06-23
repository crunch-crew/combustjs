module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.name %> - v<% pkg.version %> -' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ?  "* " + pkg.homepage + "\\n" : "" %>',

    concat: {
      options: {
        banner: '<%= banner %>',
        separator: ';\n'
      },
      dist: {
        src: ['./client/*.js'],
        dest: './client/dist/<% = pkg.name %>.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          },
        src: ['server/specs/*']
      }
    },

    uglify: {
      dist: {
        files: {
          '.client/dist/<%= pkg.name %>.min.js': ['<%= concat.dist %>']
        }
      }
    },

    jshint: {
      files: ['gruntfile.js', 'client/**/*.js', 'server/spec/*.js', 'server/utils/*', 'server/*.js'],
    },

    watch: {
      scripts: {
        files: ['**/*.js'], 
        task: ['dev']
      },
      options: {
        spawn: false,
        livereload: true,
      }
    },

    nodemon: {
      options: {
        ignoredFiles: ['node_modules/**', 'client/**/*']
      },
      dev: {
        script: 'server/server.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['jshint', 'mochaTest']);
  grunt.registerTask('test', ['jshint', 'mocha']);
  grunt.registerTask('development', ['jshint', 'mocha', 'mocha-test']);

};