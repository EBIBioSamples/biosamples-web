var elixir = require('laravel-elixir');

// require('laravel-elixir-browser-sync-simple');
require('laravel-elixir-vueify');


elixir(function(mix) {
	mix.browserSync()
	 	.sass('main_samelf.scss')
	 	.browserify('searchComponents.js')
});

