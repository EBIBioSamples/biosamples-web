# Biosamples Web

This is the updated version of the Biosamples Web user interface (http://www.ebi.ac.uk/biosamples).  
The older version is in the Biosd-ui repository (https://github.com/EBIBioSamples/biosd_ui).
 
This new, updated version is designed to work with a Solr index as it's back-end and features simplified view technology (now using Thymeleaf instead of a combination of JSP/XSTL), but otherwise looks essentially identical and is backwards compatible.

This is also designed to be portable and reskinnable for developing project-specific (or data specific) views on Biosamples data.

# Frontend techonologies: vuejs, sass, gulp and laravel elixir

In this project we are using bunch of different web technologies to help the developer write less code and be more productive. 
Even if at the beginning this could seem a little bit overwelming for all the different pieces put togheter, you will find yourself writing less code and doing less repetitive tasks.
Let's start

## [vuejs](vuejs.org)
Vue.js is a library for building web interfaces. Together with some other tools you can also call it a “framework”, although it’s more like a set of optional tools that work together really well.
You can read an introduction to vue [here](http://blog.evanyou.me/2015/10/25/vuejs-re-introduction/). Both an [in-depth guide](http://vuejs.org/guide/) and the [api guide](http://vuejs.org/api/) are available and you can find almost anything you need to start working with Vue.js

## [sass](http://sass-lang.com/guide)
As stated in the homepage
> Sass is the most mature, stable, and powerful professional grade CSS extension language in the world
Sass (Syntactically Awesome StyleSheets) is a CSS preprocessor, a scripting language that __extends__ CSS by allowing developers to write code in one language and then compile it into CSS. In the specific, Sass is an extension of CSS that allows you to use things like variables, nested rules, inline imports and more. It also helps to keep things organized and allows you to create stylesheets faster.
You can write Sass with two different syntaxes: 
-.sass
-.scss
The .scss is actually fully compliant with CSS syntax, so you don't need to learn a completely new syntax to start and write your stylesheets.
In order to better understand Sass, refer this [brief introduction](http://www.creativebloq.com/web-design/what-is-sass-111517618) or to the [guide](http://sass-lang.com/guide)

You will probably need to install sass in your machine to work with it. Here some instruction to [install sass](http://sass-lang.com/install) for the command line 
## [laravel-elixir](https://laravel.com/docs/5.0/elixir)
Working with such technologies 
most of the time requires you to repeat annoyng tasks over and over again. This is were [Gulp](http://gulpjs.com/) comes in handy, helping you defining tasks to that are automatically repeated every time you want.
Gulp is based on [Node.js](https://nodejs.org/en/) technologies, and for this reason could be quite tough to grasp in the beginning.
But while Gulp could be quite difficult, [Laravel Elixir](https://laravel.com/docs/5.0/elixir) makes everything fast and easy. 
Elixir is a fluent API built on top of Gulp that let us write Gulp task easly, providing you premade task for pretty much every common need.


# Getting started 
## Assets install

### Node
First of all you need to ensure Node.js is installed on your machine.
```bash
node -v
```
If Node.js is not installed, you can easily do that visiting the [download page](http://nodejs.org/download/). It's quick and easy, so don't worry ;-).

### Sass
Next, check if you have sass installed in your machine. Just follow the instructions you can find [here](http://sass-lang.com/install) to install ruby (since Sass is ruby based) and then Sass.

### Gulp
Next, it's Gulp's turn. You'll want to pull in Gulp as a global NPM (Node Package Manager) package like so:
`
npm install --global gulp
`

### Elixir and all the other packages
Finally, install all the dependecies for the project. Note that all the dependencies are saved inside the `package.json` file, a JSON file containing all the configuration for the project you're working on
`
npm install
`

## Start to work on the project

In order to make Elixir working with a Java Spring application, an `elixir.json` file containing all specific configurations we want to use with Elixir is provided. You can find all the available options in Elixir's [Config.js](https://github.com/laravel/elixir/blob/master/Config.js);
You don't need to modify the file since everything should be in place to start your front-end development. In case something is not working, have a look at [Elixir Guide](https://laravel.com/docs/5.0/elixir) or the [Config.js](https://github.com/laravel/elixir/blob/master/Config.js) file;

You can know type:
`
gulp watch
`
and while your Spring boot application is running, either in debug or running mode, you should be able to look at the `search.html` search page on `localhost:8080`;
You can now start to develop your application modifying files within `assetsPath` defined in the `elixir.json` file


