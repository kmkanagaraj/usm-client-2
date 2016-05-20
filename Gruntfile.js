'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        nggettext_extract: {
            all: {
                options: {
                    markerNames: ['_', 'N_']
                },
                files: {
                    // Cannot extract strings from typescript format
                    'po/kitoon.pot': ['app/**/*.js', 'app/**/*.html']
                }
            },
        },

        nggettext_compile: {
            all: {
                options: {
                    format: 'json'
                },
                files: [ {
                    expand: true,
                    dot:    true,
                    dest:   'dist/languages',
                    cwd:    'po',
                    ext:    '.json',
                    src:    ['*.po']
                } ]
            },
        },
    });

    grunt.loadNpmTasks('grunt-angular-gettext');

    grunt.registerTask('default', ['nggettext_extract', 'nggettext_compile']);
};
