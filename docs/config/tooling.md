---
description: Lando tooling is a way to access useful tools inside of containers as though they were running natively. You can also use them for scripting, automation or complex dev requirements.
---

# Tooling

Lando provides a nice way to:

* Emulate the experience of a "native" command but inside of a container
* Chain multiple commands running on multiple services together
* Provide dynamic routing so one command can be used on multiple services
* Provide a simple interface so commands can handle options, including interactive ones

This allows you to:

* Consolidate complex testing or build scripts into a single `lando do-stuff` command
* Lock down the versions you need for your tooling on a per-Landofile basis
* Avoid installing nightmares like `nvm`, `rvm` and their ilk directly on your computer
* Never have to worry about which version of `php` or `grunt` you need for each project ever again

::: warning Make sure to install your dependencies!!!
You will want to make sure you install the tools you need inside of the services your app is running. If you are not clear on how to do this, check out either [build steps](./services.md#build-steps) or our [`ssh`](./../basics/ssh.md) command.
:::

[[toc]]

## Usage

It's fairly straightforward to add tooling to your Landofile using the `tooling` top level config. All the options you can use for a given tooling route and their default values are shown below:

```yaml
tooling:
  mycommand:
    service: this is required, use `lando info` to find the one you want
    description: Runs <mycommand> commands
    dir: cwd | absolute path to elsewhere
    cmd: mycommand
    user: you
    options:
    env:
```

::: tip Tooling routes are cached!
Note that tooling routes are cached at the end of every lando invocation so you will need to run something like `lando list` or dump the cache manually with `lando --clear` if you are not seeing your tooling commands or changes show up correctly.

After doing so, run `lando` to see all the tooling commands for a given Landofile.
:::

A few common implementations of the above are shown below:

### Native command emulation

One of the most common uses of tooling is to emulate native commands like `php`, `composer` or `yarn`.

```yaml
tooling:
  php:
    service: appserver
```

The above will run `php` inside of the `appserver` and also pass in any additional args or options you specify. That means that you can run `lando php` in the *exact* same way as `php`. This greatly reduces the hassle involved in invoking said commands directly with `docker`, `docker-compose` or even `lando ssh`. See below:

```bash
# OMG WHYYYYY
docker exec -it mysite_appserver_1 /bin/sh -c "/usr/local/bin/php -r 'phpinfo();'"

# Hmm ok that's a bit better
lando ssh -c "php -r 'phpinfo();'"

# Oh so nice!
lando php -r "phpinfo();"
```

### Consolidated command tooling

You may also wish to consolidate a complex command into a simpler one. This is useful because it can help prevent human error and reduce documentation.

```yaml
tooling:
  update-deps:
    service: database
    description: Updates the installed packages on my database service
    cmd: apt update -y && apt install -y
    user: root
```

```bash
lando update-deps
```

### Multi-command tooling

`cmd` can also be an array. This allows you to chain an indefinite amount of commands together.

```yaml
tooling:
  fire-everything:
    service: node
    description: Runs a seemingly random assortment of commands
    cmd:
      - source ~/.bashrc
      - npm install "$DEP_SET_BY_ENVVAR_SOURCED_BEFORE"
      - /helpers/my-custom-script.sh --max-power
      - ls -lsa
      - env | grep LANDO_
```

```bash
lando fire-everything
```

Note that each line of the above runs in a separate subshell so if you `source` a file in the first command, like we unwisely did above, it's not going to be available in any of the others. If you need that sort of behavior, instead consider something as shown below:

```yaml
tooling:
  fire-everything:
    service: node
    description: Runs a seemingly random assortment of commands
    cmd:
      - source ~/.bashrc && npm install "$DEP_SET_BY_ENVVAR_SOURCED_BEFORE"
      - /helpers/my-custom-script.sh --max-power
      - ls -lsa
      - env | grep LANDO_
```

### Multi-service Multi-command tooling

You can also omit the `service` and define `cmd` as an array of objects where the `key` is the service and the `value` is the command. This can allow you to consolidate complex testing and build steps that need to happen across many different services.

It also allows you to reuse a common interface across many different Landofiles (e.g. `lando test` may differ from project to project but it's always what we use to run our tests).

```yaml
tooling:
  build:
    description: Manually invokes all our build steps
    cmd:
      - appserver: composer install
      - node: yarn install
      - node: yarn sass
  test:
    description: Run ALL THE TESTS
    cmd:
      - appserver: composer test
      - node: yarn test
```

```bash
lando test && lando build
```

### Using environment variables

You can also set environment variables that will ONLY be available for a given tooling command.

```yaml
tooling:
  deploy:
    service: appserver
    cmd: deploy.sh
    env:
      TARGET: production
```

### Current working directory

By default Lando will run your tooling command in the container equivalent of the directory you are in on your host.

You can change this behavior by specifiying an absolute path to run your command. Note that if you want to run a command from your project root you should use `/app` as the starting point.

As an example if you wanted to install `node` dependencies from `path/to/theme` relative to you project root you would use the below.

```yaml
tooling:
  build:
    service: appserver
    cmd: yarn
    dir: /app/path/to/theme
```

### Dynamic service commands

Sometimes you have, need or want a single command that can be used on a user-specified service. In these situations, you can tell Lando to set the service with an option.

Note that the `:` prefix is what tells Lando to use an option instead of a literal string. Also note that you should be careful to avoid collisions between options *you* specify and options of the *underlying command*.

```yaml
tooling:
  php-version:
    service: :service
    cmd: php -v
    options:
      service:
        default: appserver
        describe: Run php in different service
```

```bash
# Get the version in the appserver
lando php-version

# Get the version in the second appserver
lando php-version --service appserver2

# Get the version in the third appserver
lando php-version --service appserver3
```

This can help avoid the following messy and hard-to-scale implementation.

```yaml
tooling:
  php-version:
    service: appserver
    cmd: php -v
  php-version2:
    service: appserver2
    cmd: php -v
  php-version3:
    service: appserver3
    cmd: php -v
```

### Options driven tooling

You can also define your own options for use in tooling. These options follow the same spec as [Lando tasks](./../contrib/contrib-plugins.md#tasks) and are, generally, used in combination with an underlying script.

Note that the options interface just provides a way to define and then inject options into a given command. It is up to the user to make sure the underlying command or script knows what to do with such options. Note that if you use interactive options, you need to set `level: app` as shown below:

```yaml
tooling:
  word:
    service: web
    cmd: /app/word.sh
    level: app
    options:
      word:
        passthrough: true
        alias:
          - w
        describe: Print what the word is
        interactive:
          type: input
          message: What is the word?
          default: bird
          weight: 600
```

```bash
# This will prompt for the word
lando word

# This will not
lando word --word=fox
```

### Tooling outside container
If you want to run a command on your host machine or combine multiple lando commands, you can do as following.
```yml
tooling:
  host-path:
    cmd: pwd
    service: _host_
  multi-lando-tooling:
    cmd:
      - _host_: lando host-path
      - appserver: pwd
```

When service is `_host_` the command will be executed on the host machine instead of inside a container.

## Overriding

You can override tooling provided by Lando recipes or upstream Landofiles by redefining the tooling command in your Landofile.

For example, if you wanted to override the built in `drush` command that comes with Drupaly recipes so that it always runs in a specific directory and always uses the `drush` you installed via `composer`, you could do as shown below:

```yml
tooling:
  drush:
    cmd: "/app/vendor/bin/drush --root=/app/web"
```

Note that if your upstream tooling has interactive options you will need to either disable those options completely or set appropriate defaults to bypass them.

```yaml
tooling:
  # Remove upstream options altogether
  pull:
    cmd: echo "Yah right imma gonna let you run this command"
    options:
  # Modify upstream options
  push:
    cmd: /helpers/my-special-push.sh
    options:
      code:
        default: none
```

## Disabling

You can also use "tooling overrides" to disable any other predefined or upstream tooling by setting the command to a non-object value in your Lando file.

While any value will do, it's customary to use `disabled` as shown below:

```yml
tooling:
  push: disabled
```

## Directory Mapping

Lando will try to map your host directory to the analogous directory inside the service. This should **MAKE IT SEEM** as though you are running the command locally (e.g. not in a container). Consider the example below:

```bash
cd /path/to/my/app
lando ssh -c "pwd"
# /app
cd web
lando ssh -c "pwd"
# /app/web

```

## Tool Discovery

If you are not sure about what tools live inside your container, you can use `lando ssh` to drop into a shell on a specific service to both investigate and install any needed dependencies.

Note that while you can do the below, it's, generally, recommended to install any additional dependencies as part of a build process using either the specific dependency management options built into the service you are using or with Lando's more generic [build steps](./services.md#build-steps).

::: warning Make sure to install your dependencies!!!
Not installing dependencies as part of the build process will result in the loss of those dependencies if `lando rebuild` is executed or the service container is removed.
:::

```bash
# SSH into the appserver
lando ssh -s appserver

# Explore whether grunt is installed
which grunt
# not installed

# Add grunt
npm install -g grunt-cli

# Exit the appserver container
exit

# Add grunt to the tooling in your .lando.yml
```

<RelatedGuides tag="Tooling"/>
