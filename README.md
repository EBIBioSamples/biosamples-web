# Biosamples Web

This is the updated version of the Biosamples Web user interface (http://www.ebi.ac.uk/biosamples).  
The older version is in the Biosd-ui repository (https://github.com/EBIBioSamples/biosd_ui).
 
This new, updated version is designed to work with a Solr index as it's back-end and features simplified view technology (now using Thymeleaf instead of a combination of JSP/XSTL), but otherwise looks essentially identical and is backwards compatible.

This is also designed to be portable and reskinnable for developing project-specific (or data specific) views on Biosamples data.

# Gulp and Laravel Elixir: Frontend build process

This package leverage some frontend technologies (npm, gulp) to simplify the development javascript and stylesheets files.

Gulp is a task runner that let you define specific tasks for processing your files. In this particular case, we are using [Laravel Elixir](https://laravel.com/docs/master/elixir) as a fluent API to write gulp file easily.

In order to make Elixir working with a Java Spring application, an `elixir.json` file containing all specific configurations we want to use with Elixir is provided. You can find all the available options in Elixir's [Config.js](https://github.com/laravel/elixir/blob/master/Config.js);

# Getting started

First of all you should have `node.js` installed in your system in order to use Gulp/Elixir. Here the link to [Node.js](https://nodejs.org/en/);

Once installed, you should run from your bash

```bash
npm install
```

with this command you should be able to install all the dependencies necessary to your project.
You can now start to develop your application modifying files within `assetsPath` defined in the `elixir.json` file


