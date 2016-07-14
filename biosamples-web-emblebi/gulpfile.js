var elixir = require('laravel-elixir');
var srcStaticPath = elixir.config.publicPath;
var publicCssPath = `${elixir.config.publicPath}${elixir.config.css.outputFolder}`;

require('laravel-elixir-vueify');

elixir(function(mix) {
    mix.browserSync({
            files: [
                srcStaticPath + "/**/*.html",
                srcStaticPath + "/**/*.js",
                srcStaticPath + "/**/*.css"
            ]
        })
	 	.sass('base.scss')
	 	.browserify('searchComponents.js')
        .browserify('relationsVis.js')
        .browserify('samplesInGroup.js')
	 	.scripts('toolsFunctions.js')
});