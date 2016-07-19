var elixir = require('laravel-elixir');
var publicCssPath = `${elixir.config.publicPath}${elixir.config.css.outputFolder}`;

elixir(function(mix) {
    mix.sass('style.scss')
});
