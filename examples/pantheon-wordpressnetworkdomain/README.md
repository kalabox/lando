Pantheon WordPress Network DomainExample
==========================

This example exists primarily to test the following documentation:

* [Pantheon Recipe - WordPress Network](https://docs.devwithlando.io/tutorials/pantheon.html)

**Note that you will need to replace (or export) `$PANTHEON_MACHINE_TOKEN` and `--pantheon-site` to values that make sense for you.**

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the lando pantheon test wordpress site
rm -rf wordpress && mkdir -p wordpress && cd wordpress
lando init --source pantheon --pantheon-auth "$PANTHEON_MACHINE_TOKEN" --pantheon-site landobot-network-domain

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
cd wordpress
lando wp eval "phpinfo();"

# Should have wp cli
cd wordpress
lando wp cli version

# Should set /var/www/.wp-cli/config.yml with LANDO_WEBROOT as PATH
cd wordpress
lando ssh -s appserver -c "cat /var/www/.wp-cli/config.yml | grep path | grep /app"

# Should have terminus
cd wordpress
lando terminus -V

# Should be logged in
cd wordpress
lando terminus auth:whoami | grep landobot@devwithlando.io

# Should use custom php version if set in pantheon.yml or pantheon.local.yml
cd wordpress
lando php -v | grep "PHP 7.3"

# Should set the correct wordpress specific pantheon environment
cd wordpress
lando ssh -c "env" | grep FRAMEWORK | grep wordpress_network
lando ssh -c "env" | grep FILEMOUNT | grep "wp-content/uploads"

# Should disable edge, index or cache containers and tools when specified
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_appserver_nginx_1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_appserver_1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_database_1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_cache_1 || echo $? | grep 1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_index_1 || echo $? | grep 1
docker ps --filter label=com.docker.compose.project=landobotwordpress | grep landobotwordpress_edge_1 || echo $? | grep 1

# Should serve proxy from nginx
cd wordpress
curl -LI http://landobot-network-domain.lndo.site | grep Via || echo $? | grep 1

# Should serve subsites
curl -L http://site1.landobot-network-folder.lndo.site | grep site1 || echo $? | grep 1
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
