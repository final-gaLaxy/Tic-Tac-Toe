//Load Grunt

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //Start Tasks
        sass: {
            //Begin Sass plugin
            dist: {
                files: (function() {
                    let stylesheets = grunt.file.expand({ filter: 'isFile', cwd: 'sass' }, ["*.scss"]);
                    let out = [];
                    stylesheets.forEach(function(element, index) {
                        let src = 'sass/' + stylesheets[index];
                        let dest = 'public/src/css/' + element.split('.')[0] + '.min.css';
                        out.push({
                            [dest]: src
                        });
                    });
                    return out;
                })(),
                options: {
                    style: 'compressed',
                    sourcemap: 'none',
                    noCache: true
                }
            }
            // For the watch plugin script
            /*
            dist: {
                files: {
                    'public/src/css/style.min.css': 'sass/style.scss'
                },
                options: {
                    style: 'compressed',
                    noCache: true
                }
            }
            */
        },
        postcss: {
            options: {
                map: false,
                processors: [
                    require('autoprefixer')()
                ]
            },
            dist: {
                files: (function() {
                    let stylesheets = grunt.file.expand({ filter: 'isFile', cwd: 'public/src/css' }, ["*.css"]);
                    let out = [];
                    stylesheets.forEach(function(element, index) {
                        let dest = 'public/src/css/' + element.split('.')[0] + '.min.css';
                        out.push({
                            [dest]: dest
                        });
                    });
                    return out;
                })(),
            }
        },
        uglify: {
            compress: {
                files: (function() {
                    let scripts = grunt.file.expand({ filter: 'isFile', cwd: 'js' }, ["*.js"]);
                    let out = [];
                    scripts.forEach(function(element, index) {
                        let src = 'js/' + scripts[index];
                        let dest = 'public/src/js/' + element.split('.')[0] + '.min.js';
                        out.push({
                            src: src,
                            dest: dest
                        });
                    });
                    return out;
                })()
            }
        },
        watch: {
            //Compile everything into one task with Watch Plugin
            css: {
                files: '**/*.scss',
                tasks: ['sass:dist', 'postcss'],
                options: { nospawn: false }
            },
            js: {
                files: 'js/*.js',
                tasks: ['uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-postcss');

    grunt.registerTask('default', ['watch']);

    // TODO: Create a script for the watch plugin that only updates or creates the changed file to reduce compressing times

    /*
    grunt.event.on('watch', function(action, filepath, target) {

        var option = 'sass.dist.files';
        var result = [];
        var dest = filepath
        dest = dest.substr(5, dest.length - 10);
        result.push({
            ['public/src/css/' + dest + '.min.css']: filepath
        });
        console.log('Result: ' + result);
        grunt.config(option, result);
    });
    */
}