Basics Example
==============

This example exists primarily to test the following documentation:

**Basics**

* [Landofiles](http://docs.devwithlando.io/config/lando.html)
* [Environment](http://docs.devwithlando.io/config/env.html)

**CLI**

* [`lando config`](http://docs.devwithlando.io/cli/config.html)
* [`lando destroy`](http://docs.devwithlando.io/cli/destroy.html)
* [`lando info`](http://docs.devwithlando.io/cli/info.html)
* [`lando list`](http://docs.devwithlando.io/cli/list.html)
* [`lando logs`](http://docs.devwithlando.io/cli/logs.html)
* [`lando poweroff`](http://docs.devwithlando.io/cli/poweroff.html)
* [`lando info`](http://docs.devwithlando.io/cli/info.html)
* [`lando rebuild`](http://docs.devwithlando.io/cli/rebuild.html)
* [`lando restart`](http://docs.devwithlando.io/cli/restart.html)
* [`lando ssh`](http://docs.devwithlando.io/cli/ssh.html)
* [`lando start`](http://docs.devwithlando.io/cli/start.html)
* [`lando stop`](http://docs.devwithlando.io/cli/stop.html)
* [`lando version`](http://docs.devwithlando.io/cli/version.html)

See the [Landofiles](http://docs.devwithlando.io/config/lando.html) in this directory for the exact magicks.

Start up tests
--------------

```bash
# Should start successfully
lando poweroff
lando start
```

Verification commands
---------------------

Run the following commands to verify things work as expected

```bash
# Should merge in all Landofiles correctly
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_log_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web2_1

# Should merge in all Landofiles correctly even if we are down a directory
cd docker-compose
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_log_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web2_1
cd ..

# Should load environment files from all Landofiles
lando ssh -s web -c "env" | grep "MILEY=CYRUS"
lando ssh -s web -c "env" | grep "TAYLOR=SWIFT"
lando ssh -s web -c "env" | grep "LOCAL=LANDO"

# Should load environment files from all Landofiles if we are down a directory
cd environment
lando ssh -s web -c "env" | grep "MILEY=CYRUS"
lando ssh -s web -c "env" | grep "TAYLOR=SWIFT"
lando ssh -s web -c "env" | grep "LOCAL=LANDO"
cd ..

# Should return lando help
lando config --help | grep verbose
lando config --lando | grep verbose

# Should return the version
lando version | grep 3.0.0

# Should run with specified verbosity
lando config -v | grep info
lando config -vv | grep verbose
lando config -vvv | grep debug
lando config -vvvv | grep silly

# Should run lando config without error
lando config

# Should only show specified field in lando config
lando config --path mode | grep cli
lando config -p mode | grep cli
lando config --field mode | grep cli
lando config --field mode | grep recipes || echo $? | grep 1

# Should output JSON in lando config without error
lando config --format json

# Should run lando info without error
lando info

# Should return docker inspect data
lando info -d | grep NetworkSettings
lando info --deep | grep NetworkSettings

# Should output JSON in lando info without error
lando info --format json

# Should return a specified path when given with lando info
lando info --path "[0]" | grep service | wc -l | grep 1

# Should list this apps containers
lando list | grep landobase_log_1
lando list | grep landobase_web_1
lando list | grep landobase_web2_1

# Should output JSON in lando list without error
lando list --format json

# Should return a specified path when given with lando list
lando list --path "landobase" | grep landobase

# Should return logs without error
lando logs

# Should return only logs for the specified service
lando logs -s web2 | grep log_1 || echo $? | grep 1
lando logs --service web2 | grep log_1 || echo $? | grep 1

# Should run a command as the LANDO_WEBROOT_USER by default
lando ssh -s web2 -c "id | grep \\\$LANDO_WEBROOT_USER"

# Should run a command as the user specific
lando ssh -s web2 -u root -c "id | grep root"

# Should stop the apps containers
lando stop
docker ps --filter label=com.docker.compose.project=landobase -q | wc -l | grep 0

# Should stop ALL running lando containers
lando start
docker ps --filter label=io.lando.container=TRUE -q | wc -l | grep 3
lando poweroff
docker ps --filter label=io.lando.container=TRUE -q | wc -l | grep 0

# Should skip stopping lando base app
lando start
docker ps --filter label=io.lando.container=TRUE -q | wc -l | grep 3
lando poweroff --exclude landobase
docker ps --filter label=io.lando.container=TRUE -q | wc -l | grep 3

# Should rebuild the services without errors
lando rebuild -y
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_log_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web2_1

# Should only rebuild the specified services
lando rebuild -y --service web2
lando rebuild -y -s web2
docker ps --latest | grep landobase_web2_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_log_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web2_1

# Should restart the services without errors
lando restart
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_log_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web_1
docker ps --filter label=com.docker.compose.project=landobase | grep landobase_web2_1

# Should have non-numeric keys in LANDO_INFO
lando php info.php
```

Destroy tests
-------------

```bash
# Should destroy successfully
lando destroy -y
lando poweroff
```
