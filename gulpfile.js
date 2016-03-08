var elixir = require('laravel-elixir');

// require('laravel-elixir-browser-sync-simple');
require('laravel-elixir-vueify');


elixir(function(mix) {
    mix.browserSync({files: ["src/main/resources/static/**/*.html", "src/main/resources/static/**/*.js", "src/main/resources/static/**/*.css"]})
	 	.sass('main_samelf.scss')
	 	.browserify('searchComponents.js')
});
           
