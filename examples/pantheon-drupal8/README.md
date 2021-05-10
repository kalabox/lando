Pantheon Drupal 8 Example
=========================

This example exists primarily to test the following:

* [Pantheon Recipe - Drupal 8](https://docs.devwithlando.io/tutorials/pantheon.html)

**Note that you will need to replace (or export) `$PANTHEON_MACHINE_TOKEN` and `--pantheon-site` to values that make sense for you.**

Start up tests
--------------

Run the following commands to get up and running with this example.

```bash
# Should poweroff
lando poweroff

# Should initialize the lando pantheon test drupal8 site
rm -rf drupal8 && mkdir -p drupal8 && cd drupal8
lando init --source pantheon --pantheon-auth "$PANTHEON_MACHINE_TOKEN" --pantheon-site landobot-drupal8 --option composer_version=1.10.1

# Should start up our drupal8 site successfully
cd drupal8
lando start

# Should pull down database and files for our drupal8 site
cd drupal8
lando pull --code none --database dev --files dev --rsync
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should be able to bootstrap drupal8
cd drupal8
lando drush status | grep "Connected"

# Should use the drush in pantheon.yml or pantheon.local.yml
cd drupal8
lando drush version | grep 10.

# Should have terminus
cd drupal8
lando terminus -V

# Should be logged in
cd drupal8
lando terminus auth:whoami | grep landobot@devwithlando.io

# Should have a binding.pem in all the right places
cd drupal8
lando ssh -s appserver -c "stat /var/www/certs/binding.pem"
lando ssh -s appserver -u root -c "stat /root/certs/binding.pem"

# Should set the correct pantheon environment
cd drupal8
lando ssh -c "env" | grep BACKDROP_SETTINGS | grep pantheon
lando ssh -c "env" | grep CACHE_HOST | grep cache
lando ssh -c "env" | grep CACHE_PORT | grep 6379
lando ssh -c "env" | grep DB_HOST | grep database
lando ssh -c "env" | grep DB_PORT | grep 3306
lando ssh -c "env" | grep DB_USER | grep pantheon
lando ssh -c "env" | grep DB_PASSWORD | grep pantheon
lando ssh -c "env" | grep DB_NAME | grep pantheon
lando ssh -c "env" | grep FRAMEWORK | grep drupal8
lando ssh -c "env" | grep FILEMOUNT | grep "sites/default/files"
lando ssh -c "env" | grep PANTHEON_ENVIRONMENT | grep lando
lando ssh -c "env" | grep PANTHEON_INDEX_HOST | grep index
lando ssh -c "env" | grep PANTHEON_INDEX_PORT | grep 449
lando ssh -c "env" | grep PANTHEON_SITE | grep 0831109d-10e9-426a-845a-e8396554acfa
lando ssh -c "env" | grep PANTHEON_SITE_NAME | grep landobot-drupal8
lando ssh -c "env" | grep php_version | grep "7.3"
lando ssh -c "env" | grep PRESSFLOW_SETTINGS | grep pantheon
lando ssh -c "env" | grep TERMINUS_ENV | grep dev
lando ssh -c "env" | grep TERMINUS_SITE | grep landobot-drupal8
lando ssh -c "env" | grep TERMINUS_USER | grep landobot@devwithlando.io

# Should use php version in pantheon.upstream.yml
cd drupal8
lando php -v | grep "PHP 7.3"

# Should have all pantheon services running and their tooling enabled by defaults
docker ps --filter label=com.docker.compose.project=landobotdrupal8 | grep landobotdrupal8_appserver_nginx_1
docker ps --filter label=com.docker.compose.project=landobotdrupal8 | grep landobotdrupal8_appserver_1
docker ps --filter label=com.docker.compose.project=landobotdrupal8 | grep landobotdrupal8_database_1

# Should not have xdebug enabled by defaults
cd drupal8
lando php -m | grep xdebug || echo $? | grep 1

# Should be able to push commits to pantheon
cd drupal8
lando pull --code dev --database none --files none
lando ssh -s appserver -c "git rev-parse HEAD > test.log"
lando push --code dev --database none --files none --message "Testing commit $(git rev-parse HEAD)"

# Should allow code pull from protected environments
# https://github.com/lando/lando/issues/2021
cd drupal8
lando pull --code test --database none --files none
lando pull --code live --database none --files none
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be able to remove our pantheon ssh keys
cp -r remove-keys.sh drupal8/remove-keys.sh
cd drupal8
lando ssh -s appserver -c "/app/remove-keys.sh $(hostname)"
cd ..
rm -rf drupal8/remove-keys.sh

# Should be able to destroy our drupal8 site with success
cd drupal8
lando destroy -y
lando poweroff
```
