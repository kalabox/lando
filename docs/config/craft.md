---
description: Use Craft CMS on Lando for local development; powered by Docker and Docker Compose, config php version, swap db or caching backends or web server, use composer. Craft CMS CLI and artisan, xdebug and custom config files, oh and also import and export databases.
---

# Craft CMS

Craft empowers the entire creative process.

Lando offers a configurable [recipe](./../config/recipes.md) for developing [Craft CMS](https://craftcms.com) websites.

[[toc]]

## Getting Started

Before you get started with this recipe, we assume that you have:

1. [Installed Lando](./../basics/installation.md) and gotten familiar with [its basics](./../basics/).
2. Have [composer installed](https://getcomposer.org/doc/00-intro.md)
2. [Installed Craft CMS](https://craftcms.com/docs/3.x/installation.html#step-1-download-craft).
3. [Initialized](./../basics/init.md) a [Landofile](./../config/lando.md) for your codebase for use with this recipe.
4. Read about the various [services](./../config/services.md), [tooling](./../config/tooling.md), [events](./../config/events.md) and [routing](./../config/proxy.md) Lando offers.


However, because you are a developer and developers never ever [RTFM](https://en.wikipedia.org/wiki/RTFM), you can also try out this recipe with a vanilla install of Craft with the commands as follows:

```bash
# Install Craft CMS locally
composer create-project my-first-craft-site

# Move into the project
cd my-first-craft-site

# Initialize a Craft CMS recipe
lando init \
  --source cwd \
  --recipe craft \
  --webroot web \
  --name my-first-craft-site

# Start it up
lando start

# List information about this app.
lando info

# Setup Craft CMS and Install
lando craft setup
```

## Configuration

While Lando [recipes](./../config/recipes.md) set sane defaults so they work out of the box, they are also [configurable](./../config/recipes.md#config).

Here are the configuration options, set to the default values, for this recipe's [Landofile](./../config/lando.md). If you are unsure about where this goes or what this means, we *highly recommend* scanning the [recipes documentation](./../config/recipes.md) to get a good handle on how the magicks work.

```yaml
recipe: craft
config:
  php: '7.3'
  composer_version: '2.0.3'
  via: apache:2.4
  webroot: web
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

You can set `php` to any version that is available in our [php service](./php.md). However, you should consult the [Craft CMS requirements](https://craftcms.com/docs/3.x/requirements.html) to make sure that version is actually supported by Craft CMS itself.

The [recipe config](./../config/recipes.md#config) to set the Craft CMS recipe to use `php` version `7.1` is shown below:

```yaml
recipe: craft
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

### Choosing a web server

By default, this recipe will be served by the default version of our [apache](./apache.md) service but you can also switch this to use [`nginx`](./nginx.md). We *highly recommend* you check out both the [apache](./apache.md) and [nginx](./nginx.md) services before you change the default `via`.

#### With Apache (default)

```yaml
recipe: craft
config:
  via: apache
```

#### With nginx

```yaml
recipe: craft
config:
  via: nginx
```

### Choosing a database backend

By default, this recipe will use the default version of our [mysql](./mysql.md) service as the database backend but you can also switch this to use [`mariadb`](./mariadb.md) or ['postgres'](./postgres.md) instead. Note that you can also specify a version *as long as it is a version available for use with lando* for either `mysql`, `mariadb` or `postgres`.

If you are unsure about how to configure the `database`, we *highly recommend* you check out the [mysql](./mysql.md), [mariadb](./mariadb.md)and ['postgres'](./postgres.md) services before you change the default.

Also note that like the configuration of the `php` version, you should consult the [Craft CMS requirements](https://craftcms.com/docs/3.x/requirements.html) to make sure the `database` and `version` you select is actually supported by Craft CMS itself.

#### Using MySQL (default)

```yaml
recipe: craft
config:
  database: mysql
```

#### Using MariaDB

```yaml
recipe: craft
config:
  database: mariadb
```

#### Using Postgres

```yaml
recipe: craft
config:
  database: postgres
```

#### Using a custom version

```yaml
recipe: craft
config:
  database: postgres:9.6
```

### Choosing a caching backend

By default, this recipe will not spin up a caching backend.

However, you can specify one using the `cache` recipe config and setting it to use either our use [`redis`](./redis.md) or [`memcached`](./memcached.md) service. Note that you can optionally/additionally specify a particular version for either *as long as it is a version documented as available for use with lando* for either service.

If you are unsure about how to configure the `cache`, we *highly recommend* you check out our [redis](./redis.md) and [memcached](./memcached.md)) docs as well as the [Craft CMS ones](https://craftcms.com/docs/3.x/config/#cache-component).

#### Using redis (recommended)

```yaml
recipe: craft
config:
  cache: redis
```

#### Using Memcached

```yaml
recipe: craft
config:
  cache: memcached
```

#### Using a custom version

```yaml
recipe: craft
config:
  cache: redis:2.8
```

### Using xdebug

This is just a passthrough option to the [xdebug setting](./php.md#toggling-xdebug) that exists on all our [php services](./php.md). The `tl;dr` is `xdebug: true` enables and configures the php xdebug extension and `xdebug: false` disables it.

```yaml
recipe: craft
config:
  xdebug: true|false
```

However, for more information we recommend you consult the [php service documentation](./php.md).


### Using custom config files

You may need to override our [default Craft CMS config](https://github.com/lando/lando/tree/master/plugins/lando-recipes/recipes/craft) with your own.

If you do this, you must use files that exist inside your application and express them relative to your project root as shown below:

Note that the default files may change based on how you set both `ssl` and `via`. Also note that the `vhosts` and `server` config will be either for `apache` or `nginx` depending on how you set `via`. We *highly recommend* you check out both the [apache](./apache.md#configuration) and [nginx](./nginx.md#configuration) if you plan to use a custom `vhosts` or `server` config.

#### A hypothetical project

Note that you can put your configuration files anywhere inside your application directory. We use a `config/lando` directory but you can call it whatever you want such as `.lando` in the example below:

```bash
./
|-- config
    |-- lando
       |-- default.conf
       |-- my-custom.cnf
       |-- php.ini
       |-- server.conf
|-- web
|-- .lando.yml
```

#### Landofile using custom Craft CMS config

```yaml
recipe: craft
config:
  config:
    database: config/lando/my-custom.cnf
    php: config/lando/php.ini
    server: config/lando/server.conf
    vhosts: config/lando/default.conf
```

## Environment File

By default, Craft CMS comes with a blank `.env` configuration.. You will want to modify the following `.env` key so that it makes sense for use with Lando.

What that file would look like if you installed Craft CMS [as above](#getting-started) is shown below:

Note that your file might be slightly different depending on your configuration.

```bash
# The environment Craft is currently running in (dev, staging, production, etc.)
ENVIRONMENT=dev

# The application ID used to to uniquely store session and cache data, mutex locks, and more
APP_ID=CraftCMS--23b87058-2ee6-462e-ae18-3645d3d33450

# The secure key Craft will use for hashing and encrypting data
SECURITY_KEY=zm1ZfQp79l1NlN7ipXRuR1WycnauYtEN

# The database driver that will be used (mysql or pgsql)
DB_DRIVER=mysql

# The database server name or IP address
DB_SERVER=database

# The port to connect to the database with
DB_PORT=

# The name of the database to select
DB_DATABASE=craft

# The database username to connect with
DB_USER=craft

# The database password to connect with
DB_PASSWORD=craft

# The database schema that will be used (PostgreSQL only)
DB_SCHEMA=public

# The prefix that should be added to generated table names (only necessary if multiple things are sharing the same database)
DB_TABLE_PREFIX=

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

The default database connection information for a Craft CMS site is shown below:

Note that the `host` is not `localhost` but `database`.

```yaml
database: craft
username: craft
password: craft
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

Once you've started up your Craft CMS site, you will need to pull in your database and files before you can really start to dev all the dev. Pulling your files is as easy as downloading an archive and extracting it to the correct location. Importing a database can be done using our helpful `lando db-import` command.

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

By default, each Lando Craft CMS recipe will also ship with helpful dev utilities.

This means you can use things like `craft`, `composer` and `php` via Lando and avoid mucking up your actual computer trying to manage `php` versions and tooling.

```bash
lando craft           Runs craft commands
lando composer          Runs composer commands
lando db-export [file]  Exports database from a service into a file
lando db-import <file>  Imports a dump file into database service
lando Craft CMS           Runs Craft CMS commands
lando mysql             Drops into a MySQL shell on a database service
lando php               Runs php commands
```

### Usage examples

```bash
# Do a basic Craft CMS gut check with cli
lando craft install/check

# Run composer install
lando composer install

# List Craft CMS commands
lando craft list

# Drop into a mysql shell
lando mysql

# Check the app's php version
lando php -v
```

You can also run `lando` from inside your app directory for a complete list of commands. This is always advisable as your list of commands may not be 100% the same as above. For example, if you set `database: postgres` you will get `lando psql` instead of `lando mysql`.

<RelatedGuides tag="Craft CMS"/>
