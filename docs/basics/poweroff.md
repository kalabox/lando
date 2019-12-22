---
metaTitle: lando poweroff | Lando
description: No! Shut them all down! lando poweroff will stop ALL lando related apps and containers.
---

# poweroff

Spins down all lando related containers

This is useful if you want to deactivate all the containers needed to run Lando. If you have another service that requires usual system resources like ports `80` and `443` this command will free them up.

Containers from one or more apps can be kept running with `--exclude`. Note that all global containers (such as the Lando proxy) will be skipped if `--exclude` is used, regardless of whether a matching app is found.

## Usage

```bash
# Spin down all running Lando containers
lando poweroff

# Spin down all containers, except those associated with a specific app
lando poweroff --exclude myapp1

# Multiple apps can be excluded with a single command
lando poweroff --exclude myapp1 --exclude myapp2
```

## Options

```bash
--exclude, -e  Exclude containers from one or more apps from being shut down
--clear        Clears the lando tasks cache
--help         Shows lando or delegated command help if applicable
--verbose, -v  Runs with extra verbosity
```
