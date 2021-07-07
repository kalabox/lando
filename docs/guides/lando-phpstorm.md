---
description: Learn how to configure xdebug in Lando using PhpStorm.
date: 2019-11-05
---

# Lando + PhpStorm + Xdebug

<GuideHeader />
<YouTube url="https://www.youtube.com/embed/sHNJxx0L9r0" />

[PhpStorm](https://www.jetbrains.com/phpstorm/) is a popular code IDE for PHP
and Drupal development. This video tutorial shows you how to set up PhpStorm with Xdebug.

If you’ve a local php installation (for example php 7.1 installed with homebrew on macOS) that listens on port 9000 you may need to change the containers php.ini port specification to another port (i.e. `xdebug.remote_port=9001`) and tell phpstorm to listen on that port. See also [Debugging Drupal 8 with PHPstorm and Lando on your Mac](https://www.isovera.com/blog/debugging-drupal-8-phpstorm-and-lando-your-mac).

### PHP 7.3 and later
With PHP 7.3, the setting `xdebug.remote_port` has been deprecated, and the setting `xdebug.client_port` should be used instead.
Also the default xdebug port changed from `9000` to `9003`.

https://xdebug.org/docs/upgrade_guide#changed-xdebug.remote_port

## Debugging Drush Commands

By default our Drupal recipes come with Drush out of the box. In order to debug any Drush command using Xdebug using
PhpStorm or a similar IDE, you will need to set an additional environment variable `PHP_IDE_CONFIG` and configure the
path mapping in your IDE accordingly.

```yaml
services:
  appserver:
    overrides:
      environment:
        # Support debugging Drush with XDEBUG.
        PHP_IDE_CONFIG: "serverName=appserver"
```

You are free to assign any name to "serverName" as long as it matches the server you define in the IDE settings.
In the example above we set the variable to `appserver` and created a path mapping for the server accordingly:

![screenshot](/images/drush-xdebug-phpstorm.png)

Depending on how you have configured Xdebug to be triggered (xdebug.start_with_request is off by default) 
you will need to tell Xdebug to start debugging the request. You can do this by either setting that global
option or by setting the following environment variable before running your request:
```
export XDEBUG_SESSION="PHPSTORM"
```

<GuideFooter />
<Newsletter />
