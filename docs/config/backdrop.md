---
description: Use Backdrop CMS on Lando for local development; powered by Docker and Docker Compose, config php version, swap db backends or web server, use composer, drush, xdebug and custom config files, oh and also import and export databases.
---

# Backdrop

[Backdrop CMS](https://backdropcms.org/) is the free and Open Source CMS that helps you build websites for businesses and non-profits.

Lando offers a configurable [recipe](./../config/recipes.md) for developing [Backdrop CMS](https://backdropcms.org/) apps.

[[toc]]

## Getting Started

Before you get started with this recipe we assume that you have:

1. [Installed Lando](./../basics/installation.md) and gotten familiar with [its basics](./../basics/)
2. [Initialized](./../basics/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe
3. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.

However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM) you can also run the following commands to try out this recipe with a vanilla install of Backdrop CMS.

```bash
# Initialize a backdrop recipe using the latest backdrop version
lando init \
  --source remote \
  --remote-url https://github.com/backdrop/backdrop/releases/download/1.12.1/backdrop.zip \
  --recipe backdrop \
  --webroot backdrop \
  --name my-first-backdrop-app

# Start it up
lando start

# List information about this app.
lando info
```

## Configuration

While Lando [recipes](./../config/recipes.md) set sane defaults so they work out of the box, they are also [configurable](./../config/recipes.md#config).

Here are the configuration options, set to the default values, for this recipe's [Landofile](./../config/lando.md). If you are unsure about where this goes or what this means, we *highly recommend* scanning the [recipes documentation](./../config/recipes.md) to get a good handle on how the magicks work.

```yaml
recipe: backdrop
config:
  php: '7.2'
  composer_version: '2.0.7'
  via: apache:2.4
  webroot: .
  database: mysql:5.7
  backdrush: '1.0.0'
  xdebug: false
  config:
    database: SEE BELOW
    php: SEE BELOW
    server: SEE BELOW
    vhosts: SEE BELOW
```

Note that if the above config options are not enough, all Lando recipes can be further [extended and overriden](./../config/recipes.md#extending-and-overriding-recipes).

### Choosing a php version

You can set `php` to any version that is available in our [php service](./php.md). However, you should consult the [Backdrop requirements](https://backdropcms.org/requirements) to make sure that version is actually supported by Backdrop itself.

The [recipe config](./../config/recipes.md#config) to set the Backdrop recipe to use `php` version `5.5` is shown below:

```yaml
recipe: backdrop
config:
  php: '5.5'
```

### Choosing a composer version

You can set `composer_version` to any version that is available in our [php service](./php.md#installing-composer).

```yaml
recipe: backdrop
config:
  composer_version: '1.10.1'
```

And then update your tooling, so lando use your preferred version of composer:

```yaml
tooling:
  composer:
    service: appserver
    cmd: '/usr/local/bin/php /usr/local/bin/composer'
```

### Choosing a web server

By default, this recipe will be served by the default version of our [apache](./apache.md) service but you can also switch this to use [`nginx`](./nginx.md). We *highly recommend* you check out both the [apache](./apache.md) and [nginx](./nginx.md) services before you change the default `via`.

#### With Apache (default)

```yaml
recipe: backdrop
config:
  via: apache
```

#### With nginx

```yaml
recipe: backdrop
config:
  via: nginx
```

### Choosing a database backend

By default, this recipe will use the default version of our [mysql](./mysql.md) service as the database backend but you can also switch this to use [`mariadb`](./mariadb.md) instead. Note that you can also specify a version *as long as it is a version available for use with lando* for either `mysql` or `mariadb`.

If you are unsure about how to configure the `database`, we *highly recommend* you check out both the [mysql](./mysql.md) and [mariadb](./mariadb.md) services before you change the default.

Also note that like the configuration of the `php` version, you should consult the [Backdrop requirements](https://backdropcms.org/requirements) to make sure the `database` and `version` you select is actually supported by Backdrop itself.

#### Using MySQL (default)

```yaml
recipe: backdrop
config:
  database: mysql
```

#### Using MariaDB

```yaml
recipe: backdrop
config:
  database: mariadb
```

#### Using a custom version

```yaml
recipe: backdrop
config:
  database: mariadb:10.2
```

### Using Drush

By default, our Backdrop recipe will globally install the [latest version of Drush 8](http://docs.drush.org/en/8.x/install/) as well as the latest version of [Backdrop Drush](https://github.com/backdrop-contrib/drush). This means that you should be able to use `lando drush` out of the box.

#### Configuring your root directory

If you are using a webroot besides `.`, you will need to `cd` into that directory and run `lando drush` from there. This is because many site-specific `drush` commands will only run correctly if you run `drush` from a directory that also contains a Backdrop site.

If you are annoyed by having to `cd` into that directory every time you run a `drush` command, you can get around it by [overriding](./../config/tooling.md#overriding) the `drush` tooling command in your [Landofile](./../config/lando.md) so that Drush always runs from your `webroot`.

**Note that hard coding the `root` like this may have unforeseen and bad consequences for some `drush` commands such as `drush scr`.**

```yaml
tooling:
  drush:
    service: appserver
    cmd: drush --root=/app/PATH/TO/WEBROOT
```

### Using xdebug

This is just a passthrough option to the [xdebug setting](./php.md#toggling-xdebug) that exists on all our [php services](./php.md). The `tl;dr` is `xdebug: true` enables and configures the php xdebug extension and `xdebug: false` disables it.

```yaml
recipe: backdrop
config:
  xdebug: true|false
```

However, for more information we recommend you consult the [php service documentation](./php.md).

### Using custom config files

You may need to override our [default Backdrop config](https://github.com/lando/lando/tree/master/plugins/lando-recipes/recipes/backdrop) with your own.

If you do this, you must use files that exist inside your application and express them relative to your project root as shown below:

Note that the default files may change based on how you set both `ssl` and `via`. Also note that the `vhosts` and `server` config will be either for `apache` or `nginx` depending on how you set `via`. We *highly recommend* you check out both the [apache](./apache.md#configuration) and [nginx](./nginx.md#configuration) if you plan to use a custom `vhosts` or `server` config.

**A hypothetical project**

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory but you can call it whatever you want such as `.lando` in the example below:

```bash
./
|-- config
   |-- default.conf
   |-- my-custom.cnf
   |-- php.ini
   |-- server.conf
|-- index.php
|-- .lando.yml
```

**Landofile using custom backdrop config**

```yaml
recipe: backdrop
config:
  config:
    database: config/my-custom.cnf
    php: config/php.ini
    server: config/server.conf
    vhosts: config/default.conf
```

## Connecting to your database

Unlike other unnamed php-based CMSes, Backdrop's database connection information can be set by an environmental variable named [`BACKDROP_SETTINGS`](https://api.backdropcms.org/api/backdrop/core%21includes%21bootstrap.inc/function/backdrop_settings_initialize/1). Lando will set this variable for you which means that unless you explicitly hijack the default functionality, *you should not need to do anything* to configure your database connection.

You can also examine and use this variable in-code similarly to how you would with [`LANDO_INFO`](./../guides/lando-info.md).

```bash
lando php -r "print_r(getenv('BACKDROP_SETTINGS'));"
# {"databases":{"default":{"default":{"driver":"mysql","database":"backdrop","username":"backdrop","password":"backdrop","host":"database","port":3306}}}}
```

If you find that you still cannot connect to your database, the default information about your Backdrop database is shown below:

Note that the `host` is not `localhost` but `database`.

```yaml
database: backdrop
username: backdrop
password: backdrop
host: database
```

You can get also get the above information, and more, by using the [`lando info`](./../cli/info.md) command.

## Importing Your Database

Once you've started up your Backdrop site, you will need to pull in your database and files before you can really start to dev all the dev. Pulling your files is as easy as downloading an archive and extracting it to the correct location. Importing a database can be done using our helpful `lando db-import` command.

```bash
# Grab your database dump
curl -fsSL -o database.sql.gz "https://url.to.my.db/database.sql.gz"

# Import the database
# NOTE: db-import can handle uncompressed, gzipped or zipped files
# Due to restrictions in how Docker handles file sharing your database
# dump MUST exist somewhere inside of your app directory.
lando db-import database.sql.gz
```

You can learn more about the `db-import` command [over here](./../guides/db-import.md).

## Tooling

By default, each Lando Backdrop recipe will also ship with helpful dev utilities.

This means you can use things like `drush`, `composer` and `php` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando composer          Runs composer commands
lando db-export [file]  Exports database from a service into a file
lando db-import <file>  Imports a dump file into database service
lando drush             Runs drush commands
lando mysql             Drops into a MySQL shell on a database service
lando php               Runs php commands
```

**Usage examples**

```bash
# Download a dependency with drush
lando drush dl webform

# Check the app's installed php extensions
lando php -m
```

You can also run `lando` from inside your app directory for a complete list of commands. This is always advisable as your list of commands may not be 100% the same as above.

<RelatedGuides tag="Backdrop"/>
