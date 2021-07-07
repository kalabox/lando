---
metaTitle: Lando Basics, How Does It Work? | Lando
description: Learn Lando basics and how to configure your first Landofile for either simple or complex development and/or DevOps requirements.
---

# Lando 101

On a high level, your `lando` configuration should contain **ALL** the things you need to run, develop and test your project. The ideal we strive for is best expressed as follows:

> A user should be able to `git clone` a repository, run `lando start` and get **EVERYTHING** they need to develop their site locally in a few minutes.

Implicit in the above is that your lando configuration should **always** be checked into version control at the root directory of your project.

We've found a useful pattern here is for the senior-est, most DevOps-y person on your team to craft the initial lando configuration and be responsible for its maintenance but to generally "set it and forget it".

## Ok cool, I dig it. What do I need to get started?

In order for you to get started using the awesome power of Lando, you need to have the following:

* A [Landofile](./../config/lando.md), generally this is called `.lando.yml`
* Your application's codebase

If you are unclear on how to manually set this up, check out our [lando init](./init.md) command which can help you initialize code from various sources for use with Lando.

## So, what does this Landofile look like anyway?

As mentioned above, the Landofile is generally named `.lando.yml` but is both [configurable](./../config/lando.md) and [overridable](./../config/lando.md). It needs a `name`, but beyond that, it can contain any combination things, although generally it only uses a small subset as follows:

```yaml
name: my-app
compose:
  - docker-compose.yml
  - docker-compose-2.yml
env_file:
  - defaults.env
  - special.env
events:
  post-start:
    - /helpers/my-setup-script.sh
recipe: lamp
config:
  php: '7.2'
  xdebug: true
proxy:
  web:
    - my-app.lndo.site
services:
  web:
    type: nginx
tooling:
  env:
    service: web
```

Note that the values in each key above are not particularly relevant to what we are discussing which is the **purpose** of each. To that end, some information about each and links to their docs, if applicable, is shown below:

**name** - Nothing special here. This should be a unique way for you to identify your app.

**compose** - This is a list of `docker-compose` files you can tell Lando to start. The paths are relative to the root of your project. Generally, this option is not used in favor of Lando [recipes](./../config/recipes.md) and/or [services](./../config/services.md) but is an option that makes sense under some circumstances.

Note that services located in these files will still get injected with Lando's [default environment variables](./../config/env.md#defaults) and also be [networked](./../config/networking.md) like any other Lando service but will not get any of the extra Lando *secret sauce*.

If you are interested in using something Lando does not currently offer as a service or recipe, we recommend looking at the [custom compose](./../config/compose.md) service.

**[env_file](./../config/env.md#environment-files)** - A list of environment files relative to your project's root directory. Each file should contain a list of `KEY=VALUE` pairs that will then get injected into the environment of **every** service.

**[events](./../config/events.md)** - Events allow the user to run arbitrary commands, or combinations of commands, on arbitrary services, or combinations of services before or after certain parts of the Lando runtime. A good example is clearing out an application's cache after a database is imported.

**[recipe](./../config/recipes.md)** - Recipes are combinations of [services](./../config/services.md), [proxies](./../config/proxy.md), and [tooling](./../config/tooling.md) designed as a start-state-of-sane-defaults for a particular use case - e.g. `drupal7`.

**[config](./../config/recipes.md#configuration)** - Config allows you to set some of the more important things your recipe provides. These settings are usually different depending on the recipe you select.

**[proxy](./../config/proxy.md)** - Proxy settings allow users to map arbitrary domain names to arbitrary ports inside of arbitrary services. Think: I go to the browser and type in `myapp.lndo.site` or `millard.filmore.for.lyfe` and it loads my application.

**[services](./../config/services.md)** - Services are simplified but still highly configurable Docker containers. They are able to run [build steps](./../config/services.md#build-steps) such as installing a `php-extension` or running `yarn install` and can also be [overridden](./../config/services.md#overrides) down to the `docker-compose` level. They also get some automatic [networking](./../config/networking.md) and [security](./../config/security.md) features.

**[tooling](./../config/tooling.md)** - Tooling allows users to run arbitrary commands, or combinations of commands, on arbitrary services, or combinations of services when invoked.

This is helpful so you can run `lando yarn install` instead of `docker exec -it SERVICE yarn install` or so `lando test` can run `composer test` and `yarn test` in their respective services. You can also specify options, including interactive ones, to build out more complicated commands like `lando pull-my-database-from-aws --user=me --password=***` or to have a single command run on many services - e.g. `lando db-import dump.sql -h database2`.

**A LATE TL;DR** - We **HIGHLY** recommend you read through the linked documentation above to get a sense of the things the Landofile can do for you and/or your team.

## How do I make one?

There are various ways to craft your Landofile but we've found and observed a strategy to be *generally a good approach* as follows:

1. Shop around for a [recipe](./../config/recipes.md) that can serve as a good starting point. [lando init](./init.md) is helpful for this.
2. Add in additional [services](./../config/recipes.md) when you need more **JUICE**.
3. Define more complex [tooling](./../config/tooling.md) and [events](./../config/events.md) to simplify difficult command patterns and automate common tasks.
4. Add in some [build steps](./../config/services.md#build-steps) to further automate setting your services up or to mix in additional project dependencies.
5. Define [custom services](./../config/compose.md) as a catch all for anything else you need.
6. Create [custom recipes or services](./../contrib/contrib-plugins.md) to lock down your new power tools.
7. Rinse and repeat.

## Note about comments

If you want to comment out a line:  

```# this is the line to be commented out - comments start with # symbol ```

## You have some examples?

You can check out our [large repository of tested-every-build and working examples](https://github.com/lando/cli/tree/main/examples).  A few example Landofiles to help give you a sense of how simple or complex they can be is shown below:

### Cold as ice

```yaml
name: my-app
recipe: drupal7
```

### Lighting the match

```yaml
name: my-app
recipe: drupal7
config:
  database: postgres
  php: '7.0'
  xdebug: true
```

### He's heating up!

```yaml
name: my-app
recipe: drupal7
config:
  database: postgres
  php: '7.0'
  xdebug: true
  config:
    php: my-custom-php.ini
proxy:
  pma:
   - pma-my-app.lndo.site
services:
  node:
    type: node:10
    globals:
      gulp: latest
  pma:
    type: phpmyadmin
    hosts:
      - database
tooling:
  yarn:
    service: node
```

### He's on fire!!

```yaml
name: my-app
recipe: drupal7
config:
  database: postgres
  php: '7.0'
  xdebug: true
  config:
    php: my-custom-php.ini
events:
  post-db-import:
    - appserver: drush cc all -y
proxy:
  pma:
   - pma-my-app.lndo.site
services:
  appserver:
    build_as_root:
      - apt update -y && apt-get install vim -y
      - /helpers/my-script-to-install-php-extension.sh memcached
    build:
      - composer install
    overrides:
      environment:
        APP_LEVEL: dev
        TAYLOR: swift
  node:
    type: node:10
    globals:
      gulp: latest
  frontend:
    type: node:10
    command: yarn start
    build:
      - yarn
  pma:
    type: phpmyadmin
    hosts:
      - database
tooling:
  yarn:
    service: node
  test:
    cmd:
      - appserver: composer test
      - frontend: yarn test
```
