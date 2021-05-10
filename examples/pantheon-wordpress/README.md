Pantheon WordPress Example
==========================

This example exists primarily to test the following documentation:

* [Pantheon Recipe - WordPress](https://docs.devwithlando.io/tutorials/pantheon.html)

**Note that you will need to replace (or export) `$PANTHEON_MACHINE_TOKEN` and `--pantheon-site` to values that make sense for you.**

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the lando pantheon test wordpress site
rm -rf wordpress && mkdir -p wordpress && cd wordpress
lando init --source pantheon --pantheon-auth "$PANTHEON_MACHINE_TOKEN" --pantheon-site landobot-wordpress --option composer_version=1.10.1

# Should start up our wordpress site successfully
cd wordpress
lando start

# Should pull down database and files for our wordpress site
cd wordpress
lando pull --code none --database dev --files dev
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should be able to bootstrap wordpress
cd wordpress/web
lando wp eval "phpinfo();"

# Should have wp cli
cd wordpress
lando wp cli version

# Should use custom webroot when set in pantheon.yml or pantheon.local.yml
cd wordpress
lando ssh -s appserver -c "curl -L http://appserver_nginx" | grep "WordPress for Lando"
lando ssh -s appserver -c "curl -kL https://appserver_nginx" | grep "WordPress for Lando"
lando ssh -s appserver -c "env" | grep "LANDO_WEBROOT=/app/web"

# Should set /var/www/.wp-cli/config.yml with LANDO_WEBROOT as PATH
cd wordpress
lando ssh -s appserver -c "cat /var/www/.wp-cli/config.yml | grep path | grep /app/web"

# Should have terminus
cd wordpress
lando terminus -V

# Should use composer 1.x
cd wordpress
lando composer --version | grep Composer | grep 1.10.1

# Should be logged in
cd wordpress
lando terminus auth:whoami | grep landobot@devwithlando.io

# Should use custom php version if set in pantheon.yml or pantheon.local.yml
cd wordpress
lando php -v | grep "PHP 7.3"

# Should set the correct wordpress specific pantheon environment
cd wordpress
lando ssh -c "env" | grep FRAMEWORK | grep wordpress
lando ssh -c "env" | grep FILEMOUNT | grep "wp-content/uploads"

# Should disable edge, index or cache containers and tools when specified
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_appserver_nginx_1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_appserver_1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_database_1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_cache_1 || echo $? | grep 1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_index_1 || echo $? | grep 1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_edge_1 || echo $? | grep 1

# Should still be logged in even after a rebuild
cd wordpress
lando terminus auth:whoami | grep landobot@devwithlando.io
lando rebuild -y
lando terminus auth:whoami | grep landobot@devwithlando.io

# Should serve proxy from nginx
cd wordpress
curl -LI http://landobot-wordress.lndo.site | grep Via || echo $? | grep 1

# Should have phantomjs 2.1.1 installed at /srv/bin/phantomjs-2.1.1
cd wordpress
lando ssh -s appserver -c "/srv/bin/phantomjs-2.1.1 --version" | grep "2.1.1"

# Should have phantomjs 1.7.0 installed at /srv/bin/phantomjs
cd wordpress
lando ssh -s appserver -c "/srv/bin/phantomjs --version" | grep "1.7.0"

# Should have apache tika1.18 installed /srv/bin/tika-app-1.18.jar
cd wordpress
lando ssh -s appserver -c "java -jar /srv/bin/tika-app-1.1.jar --version" | grep "Apache Tika 1.1"

# Should have wkhtmltopdf installed at /srv/bin/wkhtmltopdf
cd wordpress
lando ssh -s appserver -c "/srv/bin/wkhtmltopdf --version"

# Should be able to push commits to pantheon
cd wordpress
lando pull --code dev --database none --files none
lando ssh -s appserver -c "git rev-parse HEAD > test.log"
lando push --code dev --database none --files none --message "Testing commit $(git rev-parse HEAD)"

# Should allow code pull from protected environments
# https://github.com/lando/lando/issues/2021
cd wordpress
lando pull --code test --database none --files none
lando pull --code live --database none --files none
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be able to remove our pantheon ssh keys
cp -r remove-keys.sh wordpress/remove-keys.sh
cd wordpress
lando ssh -s appserver -c "/app/remove-keys.sh $(hostname)"
rm -rf wordpress/remove-keys.sh

# Should be able to destroy our wordpress site with success
cd wordpress
lando destroy -y
lando poweroff
```
