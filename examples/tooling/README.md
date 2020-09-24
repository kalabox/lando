Tooling Example
===============

This example exists primarily to test the following documentation:

* [Tooling](http://docs.devwithlando.io/config/tooling.html)

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
# Should be able to run a few php commands
lando php -v
lando php -m
lando php -r "phpinfo();"

# Should run as meUser by default
lando whoami | grep www-data
lando nodeme | grep node
lando stillme | grep node

# Should run as the specified user
lando iamroot
lando ssh -s php -c "cat /whoami | grep root"
lando notme | grep www-data

# Should be able to run multiple commands on one service
lando test

# Should be able to define and pass down options to a script
lando word --word bird | grep "bird is the word"
lando word -w gird | grep "gird is the word"
lando word --word "this is actually a phrase" | grep "this is actually a phrase"

# Should be able to run multiple commands on multiple services
lando env

# Should be able to choose the service to run the command on with an option
lando dynamic --service web
lando dynamic -s php
lando dynamic --service web2

# Should know how to handle pipes and carrots
lando pipesandstuff
cat pipe.txt | grep LANDO_
cat pipe.txt | grep more

# Should be able to set envvars
lando envvar | grep swift

# Should be able to use *
lando listfiles | grep /app/README.md

# Should be able to use command substitution
lando cmdsub | grep /app/README.md

# Should be able to run bash oneliners
lando oneliner | grep HOLLA

# Should be able to handle option processing properly.
lando tooling-script --word=dog --verbose arg1 arg2 | grep "loading app lando-tooling"
lando -- tooling-script --word=dog --verbose arg1 arg2 | grep "loading app lando-tooling" || echo $? | grep 1
lando tooling-script --word=dog arg1 arg2 | grep "WORD=dog args=2: arg1 arg2"
lando tooling-script -- --word=dog arg1 arg2 | grep "WORD=bird args=3: --word=dog arg1 arg2"
lando -- tooling-script --word=dog -- arg1 -- arg3 | grep "WORD=dog args=3: arg1 -- arg3"
```

Destroy tests
-------------

```bash
# Should destroy successfully
lando destroy -y
lando poweroff
```
