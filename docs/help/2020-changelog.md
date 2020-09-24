# 2020

## v3.0.12 - In Development

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Fixed bug causing `db-import` wipe to fail on `views` [#2516](https://github.com/lando/lando/pull/2516)
* Fixed bug causing `db-import` wipe to fail on table names with hypens [#2478](https://github.com/lando/lando/pull/2478)
* Fixed bug causing `lando pull` to not correctly exclude `cache` data for `pantheon` sites
* Set `skip_permission_hardening` to `true` by default on Pantheon Drupal sites [#2504](https://github.com/lando/lando/pull/2504)
* Improved [POSIX compatibility](https://unix.stackexchange.com/a/570733) adding the ability to skip Lando option processing in tooling through the use of `--` [#2439](https://github.com/lando/lando/issues/2439)

[What does pre-release mean?](https://docs.lando.dev/config/releases.html)

## v3.0.11 - [July 31, 2020](https://github.com/lando/lando/releases/tag/v3.0.11)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added ability to override `platformsh` `variables` locally in Landofile
* Added interactivity to `platformsh` `pull` and `push` [#2496](https://github.com/lando/lando/pull/2496)
* Fixed bug causing the `proxy` to report `404` when using more than one `platformsh` app [#2507](https://github.com/lando/lando/pull/2507)
* Fixed bug causing `platformsh` recipe build to fail when webroot doesn't exist [#2529](https://github.com/lando/lando/pull/2529)
* Improved `lando init` for `platformsh` eg faster and supports MFA
* Updated to Docker Desktop `2.3.0.4` and Docker Compose `1.26.2`. Fixed [#2531](https://github.com/lando/lando/pull/2531)

[What does pre-release mean?](https://docs.lando.dev/config/releases.html)

## v3.0.10 - [July 27, 2020](https://github.com/lando/lando/releases/tag/v3.0.10)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added ability to configure the `proxy` middleware layer [#2507](https://github.com/lando/lando/pull/2507)
* Added `platformsh` specific headers to the `platformsh` recipe [#2507](https://github.com/lando/lando/pull/2507)
* Fixed bug causing `HTTPS` to not be set correctly on `platformsh` recipes [#2507](https://github.com/lando/lando/pull/2507)
* Fixed bug causing `lando` to fail if `~/.ssh` doesn't exist [#2501](https://github.com/lando/lando/pull/2501)
* Fixed bug causing `events` for `platformsh` recipes to not run with correct env
* Fixed bug causing multicommand tooling for `platformsh` recipes to not run correctly
* Improved handling of `primary` route in `platformsh` recipe [#2508](https://github.com/lando/lando/pull/2508)

[What does pre-release mean?](https://docs.lando.dev/config/releases.html)

## v3.0.9 - [July 17, 2020](https://github.com/lando/lando/releases/tag/v3.0.9)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added `command` support for `php` cli services [#2479](https://github.com/lando/lando/pull/2479)
* Added symlink from `/code -> /app` for `pantheon` apps [#2421](https://github.com/lando/lando/pull/2421)
* Fixed bug causing `lando push` commit message to get truncated to first word [#2492](https://github.com/lando/lando/pull/2492)
* Improved `db-import` and `lando pull` to handle foreign key constraints [#1850](https://github.com/lando/lando/pull/1850) [#2391](https://github.com/lando/lando/pull/2391)
* And various documentation improvements

[What does pre-release mean?](https://docs.lando.dev/config/releases.html)

## v3.0.8 - [July 14, 2020](https://github.com/lando/lando/releases/tag/v3.0.8)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added support for loading `plugins` from your application repo [#2434](https://github.com/lando/lando/pull/2434)
* Bumped `platformsh` recipe to `alpha` status [#2444](https://github.com/lando/lando/pull/2444)
* Bumped `lagoon` recipe to `alpha` status [#2451](https://github.com/lando/lando/pull/2451)
* Fixed bug causing some interactive options to not be passed through correctly [#2456](https://github.com/lando/lando/pull/2456) [#2471](https://github.com/lando/lando/pull/2471)
* Improved database pull performance for the `pantheon` recipe [#2402](https://github.com/lando/lando/pull/2402)
* Improved error message if host-side `terminus` token caches contain invalid `JSON` [#2428](https://github.com/lando/lando/pull/2428)
* Switched all usage of `:delegated` to `:cached` in preperation of `mutagen` syncing [#763](https://github.com/lando/lando/pull/763) [#2354](https://github.com/lando/lando/pull/2354)
* Updated default `drupal8` recipe `php` version to `7.3` [#2427](https://github.com/lando/lando/pull/2427)
* Updated `excludes` to use `mutagen` if its available [#763](https://github.com/lando/lando/pull/763) [#2354](https://github.com/lando/lando/pull/2354)

## v3.0.7 - [June 27, 2020](https://github.com/lando/lando/releases/tag/v3.0.7)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added ability to configure `USER` and `PORT` for `sql-import` and `sql-export` scripts with envvars
* Added ability to set environment variables for tooling commands [#2128](https://github.com/lando/lando/pull/2128)
* Changed `/user` and `/lando` mounting to use `:cached` in preperation for Mutagen
* Fixed bug causing non-semantic `drush` versions like `*` and `^` to throw errors [#2386](https://github.com/lando/lando/pull/2386)
* Fixed bug causing custom config files in `nginx` service to be modified unexpectedly [#2383](https://github.com/lando/lando/pull/2383)
* Fixed bug causing first touch non-start engine commands to fail
* Improved `/bin/sh` wrapping of tooling commands [#2279](https://github.com/lando/lando/pull/2279) [#2280](https://github.com/lando/lando/pull/2280)
* Loosened key add restrictions to improve key loading on `macOS` High Sierra [#2415](https://github.com/lando/lando/pull/2415)
* Removed excessively frequent `WARN` messages [#2389](https://github.com/lando/lando/pull/2389)
* Updated Terminus to `2.4.0` [#2417](https://github.com/lando/lando/issues/2417)

## v3.0.6 - [June 9, 2020](https://github.com/lando/lando/releases/tag/v3.0.6)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Fixed bug causing non-semantic `drush` versions like `*` and `false` to throw errors [#2372](https://github.com/lando/lando/pull/2372)

## v3.0.5 - [June 5, 2020](https://github.com/lando/lando/releases/tag/v3.0.5)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added _experimental_ support for WordPress Site Networks (Multisite) to Pantheon recipe [#1425](https://github.com/lando/lando/pull/1425)
* Added `/app/bin` into the `php` service `PATH` [#2328](https://github.com/lando/lando/pull/2328)
* Fixed bug causing "command" output to be unreadable on some terminals [#2302](https://github.com/lando/lando/pull/2302)
* Fixed bug causing `stdin` to not be read correctly for some tooling commands eg `lando drush sql-cli < dump.sql` [#1918](https://github.com/lando/lando/pull/1918)
* Fixed regression in `db-import` causing tables to not be dropped correctly
* Fixed regression causing the version in `via: nginx:1.16` to not be picked up correctly [#2300](https://github.com/lando/lando/pull/2300)
* Improved performance of user permisson `host:container` mapping [#2300](https://github.com/lando/lando/pull/2300)
* Improved `lando ssh` so that it now uses the first defined service as the default if `appserver` does not exist [#2300](https://github.com/lando/lando/pull/2300)
* Updated `varnish` ssl termination to use `nginx` `1.17` [#2300](https://github.com/lando/lando/pull/2300)

## v3.0.4 - [May 31, 2020](https://github.com/lando/lando/releases/tag/v3.0.4)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added an app warning for installing Drush `10+` globally
* Added support for `nginx` `1.16`, `1.17` and `1.18`
* Added support for Docker Desktop `2.3.0.3`
* Changed default `nginx` version to `1.17`
* Deprecated `nginx` version `1.14`
* Updated to Docker Desktop `2.3.0.3`

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: <https://docs.lando.dev/>**

## v3.0.3 - [May 15, 2020](https://github.com/lando/lando/releases/tag/v3.0.3)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added a [guide](https://docs.lando.dev/guides/using-compass-on-a-lando-node-service.html) on how to use `compass` in `node` service [#2039](https://github.com/lando/lando/pull/2039)
* Added support for `php` `7.4` to `pantheon` recipes [#2259](https://github.com/lando/lando/pull/2259)
* Added support for `apache` `tika` `1.18` to supported Pantheon `appservers`
* Fixed bug causing `Operation not permitted` for some `db-import|export` commands [#2255](https://github.com/lando/lando/pull/2255)
* Fixed bug causing `ssh` keys to be incorrectly set to `700` [#2260](https://github.com/lando/lando/pull/2260)
* Fixed bug causing overridden `ports` expressed as objects to error [#2256](https://github.com/lando/lando/pull/2256)

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: <https://docs.lando.dev/>**

## v3.0.2 - [May 12, 2020](https://github.com/lando/lando/releases/tag/v3.0.2)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added `none` as a Release Channel option
* Added a [guide](https://docs.lando.dev/guides/installing-php-extensions-on-lando.html) on how to install `php` extensions [#1894](https://github.com/lando/lando/pull/1894) [#1906](https://github.com/lando/lando/pull/1906) [#2201](https://github.com/lando/lando/pull/2201) [#2240](https://github.com/lando/lando/pull/2240)
* Added a [guide](https://docs.lando.dev/guides/installing-node-in-your-lando-php-service.html) on how to install `node` directly in a PHP service for things like PatternLab or Emulsify [#2196](https://github.com/lando/lando/pull/2196)
* Added support for `mongo` `4.2` [#2246](https://github.com/lando/lando/pull/2246)
* Added a `drupal9` **(beta)** recipe [#1993](https://github.com/lando/lando/pull/1993)
* Added `none` as a Release Channel option [#2218](https://github.com/lando/lando/pull/2218)
* Deprecated `mongo` version `4.1` [#2246](https://github.com/lando/lando/pull/2246)
* Fixed bug where `cache: none` in the Laravel recipe config caused a start error [#2236](https://github.com/lando/lando/pull/2236)
* Fixed bug causing `nginx` and `apache` to sometimes fail on a rebuild [#1986](https://github.com/lando/lando/pull/1986)
* Fixed bug causing `db-import` to not recognize some dumps from `db-export` [#2170](https://github.com/lando/lando/pull/2170)
* Fixed bug causing `db-export` to report success even when it had been cancelled on `gzip` overwrite [#2231](https://github.com/lando/lando/pull/2231)
* Fixed bug causing some Docker Engine versions on Linux to incorrectly throw an incompatibility warning [#2239](https://github.com/lando/lando/pull/2239)
* Updated default `mongo` version to `4.2` [#2246](https://github.com/lando/lando/pull/2246)
* Updated to and added support to Docker Desktop `2.3.0.2`
* Updated to and added support for `docker-compose` `1.25.5` on Linux
* Many more spelling and grammar fixes in docs, code and comments, thanks [@uberhacker](https://github.com/uberhacker)!

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: <https://docs.lando.dev/>**

## v3.0.1 - [May 7, 2020](https://github.com/lando/lando/releases/tag/v3.0.1)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Fixed regression in `build` and `event` quote passthrough logic causing other commands to not parse correctly [#1926](https://github.com/lando/lando/pull/1926)
* Fixed race condition causing proxy certs to not refresh consistently on proxy changes

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: <https://docs.lando.dev/>**

## v3.0.0 - [May 4, 2020](https://github.com/lando/lando/releases/tag/v3.0.0)

### This is an `edge` release.

Edge releases contain the newest bug fixes and features and *may* be less stable as a result. If you are an intrepid developer who wants to try the latest and greatest and/or wants to help report bugs then try this release out.

Otherwise, scroll down and use the first release that has the green `Latest Release` tag. For more information about the Lando release cycle check out [this](https://docs.lando.dev/config/releases.html).

* Added ability to customize or disable the `app_mount` on a per-service basis [#2029](https://github.com/lando/lando/issues/2029) [#1487](https://github.com/lando/lando/issues/1487)
* Fixed bug preventing recipe provided tooling from being `disabled` [#472](https://github.com/lando/lando/pull/472)
* Fixed bug not allowing build steps on Lando managed services eg `appserver_nginx` [#1990](https://github.com/lando/lando/pull/1990)
* Fixed bug not allowing user overrides on Lando managed services eg `appserver_nginx` [#1990](https://github.com/lando/lando/pull/1990)
* Fixed bug causing `PATH_INFO` and `PATH_TRANSLATED` to not be set by default on `php` services served by `nginx` [#2192](https://github.com/lando/lando/pull/2192)
* Fixed bug causing `PATH_INFO` and `PATH_TRANSLATED` to not be set by default on the `lemp` recipe [#2192](https://github.com/lando/lando/pull/2192)
* Fixed bug causing Lando to pass through the quotes on build steps or events that contained options like `--option="some thing"` [#1926](https://github.com/lando/lando/pull/1926)
* Improved overridability of `pantheon` `push|pull|switch` commands [#2166](https://github.com/lando/lando/pull/2166)
* Blasted this thing straight out of Mos Eisley [#6](https://www.youtube.com/watch?v=d9Am7nUiIyU)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: <https://docs.lando.dev/>**

## v3.0.0-rrc.8 - [May 3, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.8)

### This is an `edge` release.

Edge releases contain the newest bug fixes and features and *may* be less stable as a result. If you are an intrepid developer who wants to try the latest and greatest and/or wants to help report bugs then try this release out.

Otherwise, scroll down and use the first release that has the green `Latest Release` tag. For more information about the Lando release cycle check out [this](https://docs.lando.dev/config/releases.html).

* Added warnings if user is using unsupported Docker versions [#678](https://github.com/lando/lando/pull/678)
* Improved Lando update check to be non-blocking
* Improved warnings if needed Docker dependencies are not installed [#1901](https://github.com/lando/lando/pull/1901)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: <https://docs.lando.dev/>**

## v3.0.0-rrc.7 - [April 30, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.7)

### This is an `edge` release.

Edge releases contain the newest bug fixes and features and *may* be less stable as a result. If you are an intrepid developer who wants to try the latest and greatest and/or wants to help report bugs then try this release out.

Otherwise, scroll down and use the first release that has the green `Latest Release` tag. For more information about the Lando release cycle check out [this](https://docs.lando.dev/config/releases.html).

* Fixed bug where `proxy` was not honoring new `bindAddress` or `proxyBindAddress` settings [#2200](https://github.com/lando/lando/pull/2200)
* Fixed bug causing Lando to not install on versions of macOS it actually supports [#2203](https://github.com/lando/lando/pull/2203)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: <https://docs.lando.dev/>**

## v3.0.0-rrc.6 - [April 28, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.6)

### This is an `edge` release.

Edge releases contain the newest bug fixes and features and *may* be less stable as a result. If you are an intrepid developer who wants to try the latest and greatest and/or wants to help report bugs then try this release out.

Otherwise, scroll down and use the first release that has the green `Latest Release` tag. For more information about the Lando release cycle check out [this](https://docs.lando.dev/config/releases.html).

* Silenced `loadkeys` on `inits` that require key loading
* Improved `node` service so it uses the `node` user if it does not use privileged ports
* Improved app reporting so it doesnt hang the process if reporting node is spinning
* Fixed bug where you needed to run `lando rebuild` twice to clear the "This app was built on a different version of Lando" warning
* Fixed bug where `proxy` was not finding the correct port for multi-port proxied services
* Fixed bug where `node` services using a custom `ssl` port do not get assigned a `https://localhost:PORT` address correctly
* Fixed bug where failed `healthchecks` were not sending correct error code
* Fixed bug causing `mongodb` services to fail healthchecks
* Fixed bug causing `maxKeyWarning` to continue showing even after user has taken action [#2186](https://github.com/lando/lando/pull/2186)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: <https://docs.lando.dev/>**

## v3.0.0-rrc.5 - [April 25, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.5)

### This is an `edge` release.

Edge releases contain the newest bug fixes and features and *may* be less stable as a result. If you are an intrepid developer who wants to try the latest and greatest and/or wants to help report bugs then try this release out.

Otherwise, scroll down and use the first release that has the green `Latest Release` tag. For more information about the Lando release cycle check out [this](https://docs.lando.dev/config/releases.html).

* Added _extremely experimental_, for-testing-purposes-only support for Lagoon Drupal 8 projects, [read more](https://docs.lando.dev/config/lagoon.html)
* Added legacy `SIMPLETEST_` envvars to Drupaly recipes [#1269](https://github.com/lando/lando/pull/1269)
* Added ability for users to control which host `ssh` keys Lando uses [#2031](https://github.com/lando/lando/pull/2031)
* Added reasonable `max-file` and `max-size` limits to services so logs don't grow indefinitely [#1774](https://github.com/lando/lando/pull/1774)
* Added `proxy` support for any level of subdomains [#1819](https://github.com/lando/lando/pull/1819)
* Changed the default bind address to `127.0.0.1` and made `bindAddress` globally configurable [#2035](https://github.com/lando/lando/pull/2035)
* Fixed regression causing weird newlines on some console output [#2178](https://github.com/lando/lando/pull/2178)
* Fixed bug causing Pantheon `pull` and `push` to fail when checked out to branch that wasnt also a multidev env [#2153](https://github.com/lando/lando/pull/2153)
* Fixed bug causing Pantheon `lando push` to push to unexpected environments [#2153](https://github.com/lando/lando/pull/2153)
* Fixed bug causing `ERR_INVALID_REDIRECT` for some proxied servives [#2149](https://github.com/lando/lando/pull/2149)
* Fixed bug causing app start to fail if proxy was unable to locate suitable ports [#1857](https://github.com/lando/lando/pull/1857)
* Fixed bug causing `ssh` to fail when username or keypaths had spaces in them [#2031](https://github.com/lando/lando/pull/2031)
* Improved logging and error handling
* Improved spelling and grammar in docs, code and comments, thanks [@uberhacker](https://github.com/uberhacker)!
* Upgraded to `traefik` 2.2 [#1819](https://github.com/lando/lando/pull/1819)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: <https://docs.lando.dev/>**

## v3.0.0-rrc.4 - [April 11, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.4)

### This is an `edge` release.

Edge releases contain the newest bug fixes and features and *may* be less stable as a result. If you are an intrepid developer who wants to try the latest and greatest and/or wants to help report bugs then try this release out.

Otherwise, scroll down and use the first release that has the green `Latest Release` tag. For more information about the Lando release cycle check out [this](https://docs.lando.dev/config/releases.html).

* Added support for `postgres:12` [#2133](https://github.com/lando/lando/pull/2133)
* Added a `lando rebuild` warning if app becomes out of sync with Lando [#2098](https://github.com/lando/lando/pull/2098)
* Added option to configure the `default-authentication-plugin` for `mysql:8` services [#2135](https://github.com/lando/lando/pull/2135)
* Improved "starty" UX to communicate warnings eg "a healthcheck failed" better [#1088](https://github.com/lando/lando/pull/1088)
* Improved app start so it throws helpful instructions when start fails [#2098](https://github.com/lando/lando/pull/2098)
* Improved healthchecks so they no longer consume CPU while idle [#1088](https://github.com/lando/lando/pull/1088)
* Improved `proxy` so it automatically recreates itself when Lando is updated
* Improved `external_connection.host` so it uses `127.0.0.1` instead of `localhost`, this helps situations where the user has `mysql` running over a socket on their host
* Fixed bug causing a custom named `landoFile` and custom pre and post Landofiles to not be recognized correctly #1919](https://github.com/lando/lando/pull/1919)
* Fixed bug causing all multicommand tooling to run as `www-data` instead of the `meUser` eg `node` for node services [#1877](https://github.com/lando/lando/pull/1877)
* Fixed bug causing services built from local Dockerfiles to error when run from subdirectories [#2102](https://github.com/lando/lando/pull/1877)
* Fixed bug causing recipes to not properly identify pullable and locally built services
* Fixed bug causing `lando push --code` to fail if `git` `user.name` or `user.email` are not set [#47](https://github.com/pantheon-systems/localdev-issues/issues/47)
* Set `default-authentication-plugin` to `mysql_native_password` for LAMP MySQL 8 recipes [#2135](https://github.com/lando/lando/pull/2135)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**

## v3.0.0-rrc.3 - [April 2, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.3)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added separate `edge` and `stable` release channels, [read more](https://docs.lando.dev/config/releases.html)
* Added an `experimental` flag so users can access bleeding edge features, [read more](https://docs.lando.dev/config/experimental.html)
* Added `PATH_INFO` and `PATH_TRANSLATED` to the default `nginx` `fastcgi_params` [#1987](https://github.com/lando/lando/pull/1987)
* Added `webp` support to `php 7` images [#1715](https://github.com/lando/lando/pull/1715)
* Added subdirectory support to the `proxy` [#1824](https://github.com/lando/lando/pull/1824)
* Added support for `pantheon.yml`'s' `drush_version`
* Increased limit on amount of sites we can get from the Pantheon API [#988](https://github.com/lando/lando/pull/988)
* Fixed bug where `PATH_INFO` was not set in the `pantheon` recipe [#1987](https://github.com/lando/lando/pull/1987)
* Fixed bug causing a silent error when trying to `lando pull --code test|live` using `pantheon` recipe [#2021](https://github.com/lando/lando/pull/2021)
* Fixed bug causing Windows path separators to cause SQL Import/Export scripts to fail [#1823](https://github.com/lando/lando/issues/1823)
* Fixed bug causing `--host` flag using `=` to produce unexpected results on `db-import/export` [#2007](https://github.com/lando/lando/pull/2007)
* Improved `lando db-import` and `lando db-export` to allow absolute paths [#1768](https://github.com/lando/lando/pull/1768)
* Improved feedback from `lando db-import` and `lando db-export` commands [#2027](https://github.com/lando/lando/pull/2027)
* Improved tooling `stdio` configurability and `stderr` discovery [#2021](https://github.com/lando/lando/pull/2021)
* Readded previous `phpmyadmin` `4.x` versions for better backwards compatibility [#2062](https://github.com/lando/lando/pull/2062)
* Set `COMPOSER_MEMORY_LIMIT` to '-1'
* Updated to `composer` version `1.10.1` [#2096](https://github.com/lando/lando/pull/2096)
* Updated to latest `xdebug` in `php` version `7.4` [#2099](https://github.com/lando/lando/pull/2099)
* Updated `drush 8` to `8.3.2` [#2097](https://github.com/lando/lando/pull/2097)
* Updated to Docker Desktop `2.2.0.5` [#2052](https://github.com/lando/lando/pull/2052) [#2122](https://github.com/lando/lando/pull/2122)

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**

## v3.0.0-rrc.2 - [March 25, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.2)

### This is an `edge` release.

Edge releases contain the newest bug fixes and features and *may* be less stable as a result. If you are an intrepid developer who wants to try the latest and greatest and/or wants to help report bugs then try this release out.

Otherwise, scroll down and use the first release that has the green `Latest Release` tag. For more information about the Lando release cycle check out [this](https://docs.lando.dev/config/releases.html).

* Added support for `go` versions `1.12-1.14`,
* Added support for `solr` `8` [#1765](https://github.com/lando/lando/pull/1765)
* Added new `solr` `7` minor versions [#1765](https://github.com/lando/lando/pull/1765)
* Added support for `.mjs` files in `nginx` [#1537](https://github.com/lando/lando/issues/1537)
* Added documentation on how to set `vm.max_map_count` correctly if you cannot run `elasticsearch` correctly [#1967](https://github.com/lando/lando/issues/1967)
* Fixed bug caused by setting `TERMINUS_VERSION` in Pantheon appserver images [#1872](https://github.com/lando/lando/issues/1872)
* Fixed bug causing build steps to not run if app was manually removed [#2079](https://github.com/lando/lando/issues/2079)
* Fixed bug with app name names containing spaces [#1767](https://github.com/lando/lando/issues/1767)
* Fixed bug causing crash on `macOS` if Docker is not installed first
* Fixed bug causing CLI array data to vanish on Windows, thanks @rabauss! [#2063](https://github.com/lando/lando/issues/2063)
* Officially documented file performance `excludes` feature [#763](https://github.com/lando/lando/issues/763) [#1460](https://github.com/lando/lando/issues/1460)
* Updated `go` to use `1.14` as the default version [#2009](https://github.com/lando/lando/issues/2009)
* Updated `phpmyadmin` to use `5.0` as the default version [#2062](https://github.com/lando/lando/issues/2062)
* Upgraded to `terminus` `2.3.0` [#2082](https://github.com/lando/lando/issues/2082)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**

## v3.0.0-rrc.1 - [March 22, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-rrc.1)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Downgraded Docker Desktop for Windows to `2.2.0.3` because [#2052](https://github.com/lando/lando/issues/2052) [#2076](https://github.com/lando/lando/issues/2076)
* Switched pre-release series because apparently linux cares [#2072](https://github.com/lando/lando/issues/2072)
* Updated Docker Desktop for macOS installer to handle the 2.1 -> 2.2 upgrade better

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**

## v3.0.0-aft.2 - [March 20, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-aft.2)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added support for `mariadb` `10.4` [#2004](https://github.com/lando/lando/issues/2004)
* Added patch version pinning to `bitnami` based services [#2057](https://github.com/lando/lando/issues/2057)
* Added `rsync` to the `php:7.4` image [#2056](https://github.com/lando/lando/issues/2056)
* Fixed bug causing `--secret-toggle` to break packaged `lando`s
* Fixed bug causing prerelease version comparison produce unexpected results [#2049](https://github.com/lando/lando/issues/2049)
* Fixed breaking upstream change in all `bitnami` based services [#2057](https://github.com/lando/lando/issues/2057)

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**

## v3.0.0-aft.1 - [March 13, 2020](https://github.com/lando/lando/releases/tag/v3.0.0-aft.1)

Lando is **free** and **open source** software that relies on contributions from developers like you! If you like Lando then help us spend more time making, updating and supporting it by [contributing](https://github.com/sponsors/lando).

* Added signed `windoze` installer and binary [#2037](https://github.com/lando/lando/issues/2037)
* Added support for `node` `12` and `13` [#1866](https://github.com/lando/lando/issues/1866)
* Added support for new `node` `10` and `11` minor versions [#1981](https://github.com/lando/lando/issues/1981)
* Added support for `php` `7.4` [#1891](https://github.com/lando/lando/pull/1892)
* Added `json` and `table` formats to some `lando` commands [#1737](https://github.com/lando/lando/issues/1737)
* Added compatibility for Docker Desktop `2.2.0.4` on macOS and Windows [#1975](https://github.com/lando/lando/issues/1975)
* Fixed bug causing cli output colorization in non `TTY` contexts [#1789](https://github.com/lando/lando/issues/1789)
* Fixed bug causing `memcached` to not boot up correctly [#1827](https://github.com/lando/lando/issues/1827)
* Improved macOS and Windows Lando installers [#1975](https://github.com/lando/lando/issues/1975)
* Improved build step and restart performance [#2013](https://github.com/lando/lando/issues/2013)
* Rebased `lando` on `node` `12` for MOAR SPEEDS [#2037](https://github.com/lando/lando/issues/2037)
* Removed lingering reference to `Git for Windows` in Windoze installer [#1865](https://github.com/lando/lando/issues/1865)
* Updated to `docker-compose` `1.25.4` [#1975](https://github.com/lando/lando/issues/1975)
* Updated to Docker Desktop `2.2.0.4` for macOS and Windows [#1975](https://github.com/lando/lando/issues/1975)
* Updated `xdebug` to latest in `php` `7.2` and `7.3`
* Updated functional tests to use `hyperdrive 0.6.1` [#2037](https://github.com/lando/lando/issues/2037)

**ALSO, STILL, SERIOUSLY, READ THE DOCS!: https://docs.lando.dev/**
