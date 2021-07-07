---
description: Learn how to configure xdebug in Lando using VSCode.
date: 2019-11-05
---

# Using Lando with VSCode

<GuideHeader />

[Visual Studio Code](https://github.com/Microsoft/vscode/) is a great open source editor for programming. Debugging PHP applications with it can be easy too.

This is a basic setup to help you in this task.

[[toc]]

## Getting Started

Enable Xdebug by adding some lines to your Lando recipe.

**Lando beta versions and rc.1** need `conf:` at file root as follow:

```yaml
name: mywebsite
recipe: drupal8
config:
  webroot: docroot
  xdebug: true
  conf:
    php: .vscode/php.ini
```

**Lando rc.2+** needs `config:` under `services:` as follow:

```yaml
name: mywebsite
recipe: drupal8
services:
  appserver:
    webroot: web
    xdebug: true
    config:
      php: .vscode/php.ini
```

**Tell Lando to use additional PHP settings**

Create the custom `php.ini` file to add XDebug settings to PHP.

```bash
touch .vscode/php.ini
code .vscode/php.ini
```

The location of this file is arbitrary.

We placed it inside `.vscode/` folder simply because we find it convenient.

Add your custom XDebug settings, which will vary slightly depending on which version of PHP and xdebug you're using.

**PHP 7.2+ uses xdebug 3** and needs `config:` under `services:` as follow:

```ini
[PHP]

; Xdebug
xdebug.max_nesting_level = 256
xdebug.show_exception_trace = 0
xdebug.collect_params = 0
; Extra custom Xdebug setting for debug to work in VSCode.
xdebug.mode = debug
xdebug.client_host = ${LANDO_HOST_IP}
xdebug.client_port = 9003
xdebug.start_with_request = yes
; xdebug.remote_connect_back = 1
xdebug.log = /tmp/xdebug.log
```

**PHP 7.1 and earlier uses xdebug 2** and needs `config:` under `services:` as follow:

```ini
[PHP]

; Xdebug
xdebug.max_nesting_level = 256
xdebug.show_exception_trace = 0
xdebug.collect_params = 0
; Extra custom Xdebug setting for debug to work in VSCode.
xdebug.remote_enable = 1
xdebug.remote_autostart = 1
xdebug.remote_host = ${LANDO_HOST_IP}
; xdebug.remote_connect_back = 1
xdebug.remote_log = /tmp/xdebug.log
```

Rebuild your environment.

```bash
lando rebuild -y
```

Finally, add a custom `launch.json` file in VSCode in order to map paths so that XDebug works correctly.

```bash
touch .vscode/launch.json
code .vscode/launch.json
```

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for XDebug",
      "type": "php",
      "request": "launch",
      "port": 9003,
      "log": false,
      "pathMappings": {
        "/app/": "${workspaceFolder}/",
      }
    }
  ]
}
```

**Note: PHP 7.1 and earlier uses xdebug 2** which uses port 9000, so change the port number above accordinly.


Done!

You can now click start debugging (type F5 or click on the icon in the left sidebar).

## Advanced Setup

Optionally for better performance you can easily toggle Xdebug on and off with some custom tooling commands.

If you're using Apache, add this to your `.lando.yml`:

```yaml
services:
  appserver:
    overrides:
      environment:
        XDEBUG_MODE:
tooling:
  xdebug-on:
    service: appserver
    description: Enable xdebug for Apache.
    cmd: docker-php-ext-enable xdebug && /etc/init.d/apache2 reload && echo "Enabling xdebug"
    user: root

  xdebug-off:
    service: appserver
    description: Disable xdebug for Apache.
    cmd: rm /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && /etc/init.d/apache2 reload && echo "Disabling xdebug"
    user: root
```

If you're using Nginx, add this to your `.lando.yml`:

```yaml
services:
  appserver:
    overrides:
      environment:
        XDEBUG_MODE:
tooling:
  xdebug-on:
    service: appserver
    description: Enable xdebug for nginx.
    cmd: docker-php-ext-enable xdebug && pkill -o -USR2 php-fpm && echo "Enabling xdebug"
    user: root
  xdebug-off:
    service: appserver
    description: CUSTOM Disable xdebug for nginx.
    cmd: rm /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && pkill -o -USR2 php-fpm && echo "Disabling xdebug"
    user: root
```

Now you can turn Xdebug on or off with `lando xdebug-on` and `lando xdebug-off`. If you want Xdebug off by default, set `xdebug:false` in your appserver config:

```yaml
name: mywebsite
recipe: drupal8
services:
  appserver:
    webroot: web
    xdebug: false
    config:
      php: .vscode/php.ini
```

## Debugging PhpUnit

Debugging PhpUnit tests in VSCode requires a little more setup, but Lando helps to make it easier.

First, you need to have VSCode listen for debugging on 2 separate ports, because PhpUnit runs in one process and the tests themselves in another, and VSCode's Xdebug extension currently struggles with this. You accomplish this by have a launch.json that looks like this:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for XDebug",
      "type": "php",
      "request": "launch",
      "port": 9003,
      "log": true,
      "pathMappings": {
        "/app/": "${workspaceFolder}/",
      }
    },
    {
      "name": "PhpUnit dummy",
      "type": "php",
      "request": "launch",
      "port": 9001,
    }
  ],
  "compounds": [
    {
        "name": "PhpUnit",
        "configurations": ["Listen for XDebug", "PhpUnit dummy"]
    }
       ]
}
```

Next add some custom tooling to your .lando.yml file, that provides a command to run PhpUnit in a way points the main PhpUnit process to the PhpUnit dummy debugger we just added. (The syntax here assumes a project-specific installation of PhpUnit, not a global one).

```yml
tooling:
  phpunitdebug:
    service: appserver
    cmd: php -d xdebug.remote_port=9003 vendor/bin/phpunit
```

**Note: PHP 7.1 and earlier uses xdebug 2** which uses port 9000, so change the port number above accordinly.

Now to run debug a PhpUnit test, do the following:

1. Select the compound "PhpUnit" as your debugger in VSCode's UI, and start it.
2. Make sure you untick "Everything" in the breakpoints section of the UI, or it will break every time PhpUnit throws an exception, even if it's properly caught by PhpUnit.
3. Add a breakpoint in your code that is being tested.
4. On your command line run PhpUnit with something like `lando phpunitdebug --filter=testMyTestMethodName` (this example is of running a single test method, actually you can add any phpunit options you like at the end).

## Known issues

**Xdebug session doesn't start**

If Xdebug session doesn't start, dig into the log file inside the application.

Enter your lando app `lando ssh` and open the debug file (`/tmp/xdebug.log`). Path to the debug file is configured in your custom `php.ini`.

Now open your app in a browser and see what's being logged.

```bash
lando ssh
tail -f /tmp/xdebug.log
# Open your browser and refresh the app
```

**Xdebug says "timeout trying to connect to XX.XX.XX:9003**

Double-check your host machine allow connection on its port 9003.

This is how you can open a specific port on a Debian/Ubuntu:

`sudo iptables -A INPUT -p tcp -d 0/0 -s 0/0 --dport 9003 -j ACCEPT`

## Read More

*   [Original Gist with settings for XDebug in VSCode](https://gist.github.com/MatthieuScarset/0c3860def9ff1f0b84e32f618c740655)
*   [PHP programming in VSCode](https://code.visualstudio.com/docs/languages/php)

<GuideFooter />
<Newsletter />
