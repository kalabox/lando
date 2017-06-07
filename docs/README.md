Lando
=====

Lando is a free and open source local development environment provisioning tool built on [Docker](http://docker.com) container technology. It is the successor project to [Kalabox](http://kalabox.io).

  * [Installation](http://docs.lndo.io/installation/installing.html)
  * [Getting Started](http://docs.lndo.io/tutorials/first-app.html)
  * [Configuration](http://docs.lndo.io/config/lando.html)
  * [Recipes](http://docs.lndo.io/config/services.html)
  * [Services](http://docs.lndo.io/config/services.html)
  * [Tooling Options](http://docs.lndo.io/config/tooling.html)
  * [CLI reference](http://docs.lndo.io/cli/usage.html)
  * [Contributing](http://docs.lndo.io/dev/contributing.html)
  * [API](http://docs.lndo.io/dev/api.html)
  * [Troubleshooting and Support](http://docs.lndo.io/troubleshooting/logs.html)
  * [Examples](https://github.com/kalabox/lando/tree/master/examples)

Or browse all [our docs](http://docs.lndo.io).

The Big Picture
---------------

Lando seeks to provide stored-in-version-control, single-config-file and per-app configuration to manage the dependencies a project needs to run and developers need to develop. It aim's to be easy to use and fast.

With Lando you can...

  * Easily mimic your production environment locally.
  * Setup, develop, pull and deploy your sites super fast.
  * Standardize your teams dev environments and tools on OSX, Windows and Linux.
  * Easily customize or extend tooling, deployment options and basically any other functionality.
  * Free yourself from the tyranny of inferior local development products.

A developer should be able to get a running site and the tools needed to develop that site with a single, short config file and a few commands.

```yml
# .lando.yml lives in your repo root
name: myproject
recipe: lamp
```

```bash
git clone myproject.git
cd myproject
lando start
```

and easily configure some of the basics of that recipe

```yml
name: myproject
recipe: lamp
config:
  php: '7.1'
  webroot: www
  database: postgres:9.6
  config:
    php: config/php.ini
```

or go totally nuts and scaffold out a custom stack

```yml
name: myproject
recipe: lamp
config:
  php: '7.1'
  webroot: www
  database: postgres:9.6
  config:
    php: config/php.ini
services:
  node:
    type: node:6.10
    globals:
      grunt-cli: "latest"
  cache:
    type: memcached:1.4
    mem: 128
  search:
    type: solr:5.5
    core: hard
tooling:
  node:
    service: node
  npm:
    service: node
  grunt:
    service: node
```

Other Resources
---------------

* [Mountain climbing advice](https://www.youtube.com/watch?v=tkBVDh7my9Q)
