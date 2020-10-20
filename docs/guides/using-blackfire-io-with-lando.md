---
title: Using Blackfire.io with Lando
metaTitle: Using Blackfire.io with Lando | Lando
description: Learn how to integrate the Blackfire.io profiler with Lando
summary: Using Blackfire.io profiling with Lando
date: 2020-09-27T13:40:19.900Z
original: 
repo: 

author:
  name: James Austen
  pic: https://www.gravatar.com/avatar/15f97966bceb0d3bfe5dd030317685cb
  link: https://twitter.com/getracker

feed:
  enable: true
  author:
    - name: James Austen
      email: alliance@lando.dev
      link: https://twitter.com/getracker
  contributor:
    - name: James Austen
      email: alliance@lando.dev
      link: https://twitter.com/getracker
---

# Using Blackfire.io with Lando

<GuideHeader test="" name="James Austen" pic="https://www.gravatar.com/avatar/15f97966bceb0d3bfe5dd030317685cb" link="https://twitter.com/getracker" />
<YouTube url="" />

You may wish to use [Blackfire.io](https://blackfire.io/) to profile the execution of your PHP applications. This guide assumes that:

* You have a Blackfire account and have generated client and server tokens
* You are familiar with the Lando [compose service](/config/compose.html) 

::: warning Additional Lando config files
This guide assumes that you have a `.lando` folder to store additional Lando configuration files. If your folder name is different, then please replace it accordingly.
:::

## Configuring Lando

The cleanest way to install the [Blackfire PHP probe](https://blackfire.io/docs/integrations/docker/php-docker) onto the `appserver` container is to use a Dockerfile. This method means that Docker will internally cache the layers and will decrease the time taken to rebuild your application.

### Setting up the environment

Add the following to your main `.lando.yml` to set [environment variables](/config/env.html#environment-files) across all Lando containers:

```yaml
env_file:
  - .lando/.blackfire.env
```

Next, create a file at `.lando/.blackfire.env` with the following content, supplying the tokens provided to you from the Blackfire website. I recommend adding this environment file to your project's `.gitignore` file.

```ini
BLACKFIRE_CLIENT_ID=03******-****-****-****-**********fb
BLACKFIRE_CLIENT_TOKEN=6**************************************************************f
BLACKFIRE_SERVER_ID=e2******-****-****-****-**********6e
BLACKFIRE_SERVER_TOKEN=0**************************************************************6
```

::: tip Logging
By default, the Probe is quiet and does not produce logs. If you wish to see log output from the `blackfire` container, add `BLACKFIRE_LOG_LEVEL=4` to the environment variables.
:::

We must now direct Lando to extend the default service for your appserver. In this step, we will also add the [`blackfire`](https://hub.docker.com/r/blackfire/blackfire) service. This service contains the Blackfire agent and CLI tools.

```yaml
services:
  appserver:
    type: php:custom
    overrides:
      image: devwithlando/php:7.4-blackfire
      build:
        context: .lando/php/
        dockerfile: Dockerfile
  blackfire:
    type: compose
    myUser: blackfire
    services:
      image: blackfire/blackfire
      command: blackfire-agent
      ports:
        - 8707
```

## Creating the new Docker image

In this example, the default image used for our appserver was `devwithlando/php:7.4-apache-2`, and we have defined a new image named `devwithlando/php:7.4-blackfire`.

You may now populate `.lando/php/Dockerfile` with the following content:

```dockerfile
# Extend Lando base image
FROM devwithlando/php:7.4-apache-2

# Install Blackfire.io PHP probe
RUN version=$(php -r "echo PHP_MAJOR_VERSION.PHP_MINOR_VERSION;") \
    && curl -A "Docker" -o /tmp/blackfire-probe.tar.gz -D - -L -s https://blackfire.io/api/v1/releases/probe/php/linux/amd64/$version \
    && mkdir -p /tmp/blackfire \
    && tar zxpf /tmp/blackfire-probe.tar.gz -C /tmp/blackfire \
    && mv /tmp/blackfire/blackfire-*.so $(php -r "echo ini_get ('extension_dir');")/blackfire.so \
    && printf "extension=blackfire.so\nblackfire.agent_socket=tcp://blackfire:8707\n" > $PHP_INI_DIR/conf.d/blackfire.ini \
    && rm -rf /tmp/blackfire /tmp/blackfire-probe.tar.gz
```

If you have any additional build steps for your application, they can also be included in this file to speed up rebuild time.

Finally, you may rebuild your containers using `lando rebuild -y`, and Blackfire is up and running!

<GuideFooter test="" original="" repo=""/>
<Newsletter />
