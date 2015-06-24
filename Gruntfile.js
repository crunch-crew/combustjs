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
        src: ['server/specs/*', 'client/specs/*']
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
      files: ['gruntfile.js','server/authentication/*.js', 'server/socketHandlers/*.js', 'server/utils/*.js', 'server/*.js', 'client/*.js']
    },

    watch: {
      scripts: {
        files: ['server/server.js'], 
        tasks: ['default']
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
        command: 'apidoc -i ./server -o ./server/doc'
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

  grunt.registerTask('default', ['jshint', 'mochaTest', 'shell']);
  grunt.registerTask('dev', ['mochaTest','jshint', 'shell']);
  grunt.registerTask('watchtest', ['watch:scripts']);

};