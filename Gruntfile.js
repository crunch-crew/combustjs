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
        src: ['server/lib/specs/*.js', 'client/specs/*.js']
      }
    },

    uglify: {
      dist: {
        files: {
          'client/dist/combust.min.js': 'client/dist/combust.min.js'
        }
      }
    },

    strip_code: {
      options: {},
      target: {
        files: [
          {src: 'client/Combust.js', dest: 'client/dist/lib/Combust.js'},
          {src: 'client/Payload.js', dest: 'client/dist/lib/Payload.js'},
          {src: 'client/isolateData.js', dest: 'client/dist/lib/isolateData.js'}
        ]
      }
    },

    browserify: {
      dist: {
        files: {
          'client/dist/combust.min.js': ['client/dist/lib/Combust.js', 'client/dist/lib/Payload.js', 'client/dist/lib/isolateData.js']
        }
      }
    },

    jshint: {
      options: {
        ignores: ['server/utils/checkPermissions.js']
      },
      files: ['gruntfile.js','server/authentication/*.js', 'server/socketHandlers/*.js', 'server/utils/*.js', 'server/*.js', 'client/*.js']
    },

    watch: {
      scripts: {
        files: ['client/*.js', 'client/specs/*.js', 'server/authentication/*', 'server/socketHandlers/*', 'server/specs/*', 'server/utils/*', 'server/*.js'], 
        tasks: ['dev']
      }
    },

    nodemon: {
      options: {
        ignoredFiles: ['node_modules/**', 'client/**/*']
      },
      dev: {
        script: 'server/server.js'
      }
    },

    shell: {
      options: {
        strderr: false
      },
      yuiDoc: {
        command: 'yuidoc -o ./client/docs ./client/.'
      },
      apiDoc: {
        command: 'apidoc -i ./server/lib -o ./server/docs'
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
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-strip-code');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['jshint', 'mochaTest', 'shell', 'bower']);
  grunt.registerTask('dev', ['mochaTest', 'shell']);
  grunt.registerTask('watchtest', ['watch:scripts']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('bower', ['strip_code', 'browserify', 'uglify']);

};