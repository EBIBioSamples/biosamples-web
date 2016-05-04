var elixir = require('laravel-elixir');
var srcStaticPath = elixir.config.publicPath;

require('laravel-elixir-vueify');

elixir(function(mix) {
    mix.browserSync({
            files: [
                srcStaticPath + "/**/*.html",
                srcStaticPath + "/**/*.js",
                srcStaticPath + "/**/*.css"
            ]
        })
	 	.sass('main_samelf.scss')
	 	.browserify('searchComponents.js')
	 	.scripts('toolsFunctions.js')
});
