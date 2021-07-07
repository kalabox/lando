---
description: Use Laravel on Lando for local development; powered by Docker and Docker Compose, config php version, swap db or caching backends or web server, use composer. laravel CLI and artisan, xdebug and custom config files, oh and also import and export databases.
---

# Laravel

Laravel is The PHP Framework For Web Artisans.

Lando offers a configurable [recipe](./../config/recipes.md) for developing [Laravel](https://laravel.com) apps.

[[toc]]

## Getting Started

Before you get started with this recipe, we assume that you have:

1. [Installed Lando](./../basics/installation.md) and gotten familiar with [its basics](./../basics/).
2. [Initialized](./../basics/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe.
3. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.

However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM), you can also try out this recipe with a vanilla install of Laravel with the commands as follows:

```bash
# Initialize a laravel recipe
lando init \
  --source cwd \
  --recipe laravel \
  --webroot app/public \
  --name my-first-laravel-app

# Install laravel
lando ssh -c "composer global require laravel/installer && laravel new app"

# Start it up
lando start

# List information about this app.
lando info
```

## Configuration

While Lando [recipes](./../config/recipes.md) set sane defaults so they work out of the box, they are also [configurable](./../config/recipes.md#config).

Here are the configuration options, set to the default values, for this recipe's [Landofile](./../config/lando.md). If you are unsure about where this goes or what this means, we *highly recommend* scanning the [recipes documentation](./../config/recipes.md) to get a good handle on how the magicks work.

```yaml
recipe: laravel
config:
  php: '7.3'
  composer_version: '2.0.7'
  via: apache:2.4
  webroot: .
  database: mysql:5.7
  cache: none
  xdebug: false
  config:
    database: SEE BELOW
    php: SEE BELOW
    server: SEE BELOW
    vhosts: SEE BELOW
```

Note that if the above config options are not enough, all Lando recipes can be further [extended and overriden](./../config/recipes.md#extending-and-overriding-recipes).

### Choosing a php version

You can set `php` to any version that is available in our [php service](./php.md). However, you should consult the [Laravel requirements](https://laravel.com/docs/5.7/installation#web-server-configuration) to make sure that version is actually supported by Laravel itself.

The [recipe config](./../config/recipes.md#config) to set the Laravel recipe to use `php` version `7.1` is shown below:

```yaml
recipe: laravel
config:
  php: '7.1'
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
recipe: laravel
config:
  via: apache
```

#### With nginx

```yaml
recipe: laravel
config:
  via: nginx
```

### Choosing a database backend

By default, this recipe will use the default version of our [mysql](./mysql.md) service as the database backend but you can also switch this to use [`mariadb`](./mariadb.md) or ['postgres'](./postgres.md) instead. Note that you can also specify a version *as long as it is a version available for use with lando* for either `mysql`, `mariadb` or `postgres`.

If you are unsure about how to configure the `database`, we *highly recommend* you check out the [mysql](./mysql.md), [mariadb](./mariadb.md)and ['postgres'](./postgres.md) services before you change the default.

Also note that like the configuration of the `php` version, you should consult the [Laravel requirements](https://laravel.com/docs/5.7/database#configuration) to make sure the `database` and `version` you select is actually supported by Laravel itself.

#### Using MySQL (default)

```yaml
recipe: laravel
config:
  database: mysql
```

#### Using MariaDB

```yaml
recipe: laravel
config:
  database: mariadb
```

#### Using Postgres

```yaml
recipe: laravel
config:
  database: postgres
```

#### Using a custom version

```yaml
recipe: laravel
config:
  database: postgres:9.6
```

### Choosing a caching backend

By default, this recipe will not spin up a caching backend.

However, you can specify one using the `cache` recipe config and setting it to use either our use [`redis`](./redis.md) or [`memcached`](./memcached.md) service. Note that you can optionally/additionally specify a particular version for either *as long as it is a version documented as available for use with lando* for either service.

If you are unsure about how to configure the `cache`, we *highly recommend* you check out our [redis](./redis.md) and [memcached](./memcached.md)) docs as well as the [Laravel ones](https://laravel.com/docs/5.7/cache#configuration).

#### Using redis (recommended)

```yaml
recipe: laravel
config:
  cache: redis
```

#### Using Memcached

```yaml
recipe: laravel
config:
  cache: memcached
```

#### Using a custom version

```yaml
recipe: laravel
config:
  cache: redis:2.8
```

### Using xdebug

This is just a passthrough option to the [xdebug setting](./php.md#toggling-xdebug) that exists on all our [php services](./php.md). The `tl;dr` is `xdebug: true` enables and configures the php xdebug extension and `xdebug: false` disables it.

```yaml
recipe: laravel
config:
  xdebug: true|false
```

However, for more information we recommend you consult the [php service documentation](./php.md).


### Using custom config files

You may need to override our [default Laravel config](https://github.com/lando/lando/tree/master/plugins/lando-recipes/recipes/laravel) with your own.

If you do this, you must use files that exist inside your application and express them relative to your project root as shown below:

Note that the default files may change based on how you set both `ssl` and `via`. Also note that the `vhosts` and `server` config will be either for `apache` or `nginx` depending on how you set `via`. We *highly recommend* you check out both the [apache](./apache.md#configuration) and [nginx](./nginx.md#configuration) if you plan to use a custom `vhosts` or `server` config.

#### A hypothetical project

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

#### Landofile using custom laravel config

```yaml
recipe: laravel
config:
  config:
    database: config/my-custom.cnf
    php: config/php.ini
    server: config/server.conf
    vhosts: config/default.conf
```

## Environment File

By default, Laravel comes with a `.env` configuration file set to use `homestead`. You will want to modify the following `.env` key so that it makes sense for use with Lando.

What that file would look like if you installed laravel [as above](#getting-started) is shown below:

Note that your file might be slightly different depending on your configuration.

```bash
APP_NAME=Laravel
APP_ENV=local
APP_DEBUG=true
APP_URL=http://my-first-laravel-app.lndo.site

LOG_CHANNEL=stack

# If you set `database: mysql|mariadb` in this recipes config
DB_CONNECTION=mysql
DB_HOST=database
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=laravel

# If you set `database: postgres` in this recipes config
# DB_CONNECTION=pgsql
# DB_HOST=database
# DB_PORT=5432
# DB_DATABASE=laravel
# DB_USERNAME=postgres
# DB_PASSWORD=null

BROADCAST_DRIVER=log
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

# If you have `cache: redis` in this recipes config
# REDIS_HOST=cache
# REDIS_PASSWORD=null
# REDIS_PORT=6379

# If you added a mailhog service to this recipe
# MAIL_DRIVER=smtp
# MAIL_HOST=sendmailhog
# MAIL_PORT=1025
# MAIL_USERNAME=null
# MAIL_PASSWORD=null
# MAIL_ENCRYPTION=null
```

## Connecting to your database and/or cache

Lando will automatically set up a database with a user and password and also set an environment variable called [`LANDO INFO`](./../guides/lando-info.md) that contains useful information about how your application can access other Lando services.

The default database connection information for a Laravel site is shown below:

Note that the `host` is not `localhost` but `database`.

```yaml
database: laravel
username: laravel
password: laravel
host: database
# for mysql
port: 3306
# for postgres
# port: 5432
```

If you've also specified a caching backend, the default connection settings are shown below:

```yaml
host: cache
# Redis
port: 6379
# Memcache
port: 11211
```

You can also get the above information, and more, by using the [`lando info`](./../cli/info.md) command.

## Importing Your Database

Once you've started up your Laravel site, you will need to pull in your database and files before you can really start to dev all the dev. Pulling your files is as easy as downloading an archive and extracting it to the correct location. Importing a database can be done using our helpful `lando db-import` command.

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

By default, each Lando Laravel recipe will also ship with helpful dev utilities.

This means you can use things like `artisan`, `composer` and `php` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando artisan           Runs artisan commands
lando composer          Runs composer commands
lando db-export [file]  Exports database from a service into a file
lando db-import <file>  Imports a dump file into database service
lando laravel           Runs laravel commands
lando mysql             Drops into a MySQL shell on a database service
lando php               Runs php commands
```

### Usage examples

```bash
# Do a basic laravel gut check with artisan
lando artisan env

# Run composer install
lando composer install

# List laravel commands
lando laravel list

# Drop into a mysql shell
lando mysql

# Check the app's php version
lando php -v
```

You can also run `lando` from inside your app directory for a complete list of commands. This is always advisable as your list of commands may not be 100% the same as above. For example, if you set `database: postgres` you will get `lando psql` instead of `lando mysql`.

<RelatedGuides tag="Laravel"/>
