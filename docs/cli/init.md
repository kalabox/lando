init
====

Creates a `.lando.yml` file from various sources. Using this command you can initilize a local repo or pull down a repo from GitHub or Pantheon and get it ready to use with lando.

Usage
-----

```bash
# Generate a .lando.yml in your current directory, app is called "myapp"
lando init myapp

# Non interactively pull a site form github and set it up as a lamp site
lando init myapp github \
  --recipe lamp \
  --github-auth MYTOKEN \
  --github-repo git@github.com:kalabox/lando.git \
  --dest ./ \
  --webroot .

# Interactively pull and set up a site from pantheon
lando init myapp pantheon

# Set up a local repo with the pantheon recipe
lando init myapp --recipe pantheon
```

Pantheon
--------

In order to pull down and initialize a Lando app from Pantheon you will need to make sure you have created a [machine token](https://pantheon.io/docs/machine-tokens/). While you **CAN** pull a site from Pantheon using `lando init myapp pantheon` you can also initialize a local site or pull from GitHub and initialize that repo as a Pantheon site.

GitHub
------

In order to pull down and initialize a Lando app from GitHub you will need to make sure you have created a [personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) and that it has the `repo`, `admin:public_key` and `user` scopes.

Options
-------

```bash
  --help, -h                 Show help                                                                                                                                   [boolean]
  --recipe, -r               The recipe to use       [string] [choices: "custom", "backdrop", "drupal6", "drupal7", "drupal8", "laravel", "lamp", "lemp", "pantheon", "wordpress"]
  --github-auth              GitHub token or email of previously used token                                                                                               [string]
  --github-repo              GitHub repo URL                                                                                                                              [string]
  --pantheon-auth            Pantheon machine token or email of previously used token                                                                                     [string]
  --pantheon-site            Pantheon site machine name                                                                                                                   [string]
  --destination, --dest, -d  Specify where to init the app                                                                                                                [string]
  --webroot                  Specify the webroot relative to destination                                                                                                  [string]
  --yes, -y                  Auto answer yes to prompts                                                                                                 [boolean] [default: false]
```
