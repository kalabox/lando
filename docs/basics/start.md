---
metaTitle: lando start | Lando
description: lando start boots up the containers needed to serve, run and develop your application.
---

# start

Starts an app.

On first run this will build all relevant containers needed to run the app. On subsequent runs it will simply start the built containers.

::: warning Containers are cached!
If you start an app with a new service or container it will need to pull that container image down. This can take a moment depending on your internet connection. Subsequent pulls to that container or service are cached so they should be much faster.
:::

## Usage

```bash
# Start your app
lando start

# Shut down any other running apps before starting this one
lando start --only
```

## Options

```bash
--only, -o     Shut down any other running apps before starting this one
--clear        Clears the lando tasks cache
--help         Shows lando or delegated command help if applicable
--verbose, -v  Runs with extra verbosity
```
