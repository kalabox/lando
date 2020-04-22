---
description: Learn how to activate the Lando secret toggle
metaTitle: Activate Secret Toggle | Lando
---

# 4. Activate Secret Toggle

Lando has a secret _contributor mode_ that you need to engage to contrib. Complete the sections below to make that happen.

## Fork and install Lando from source

* If you are not a Lando committer with write access to the [official repo](https://github.com/lando/lando) start by [forking Lando](https://help.github.com/articles/fork-a-repo/).
* Follow the [install from source instructions](./../basics/installation.html#from-source) using either the [official repo](https://github.com/lando/lando) or the fork you made in Step 1.

## Engage Contrib Mode

* Verify you've installed from source correctly

```bash
# Ensure you have the correct version of node installed
node -v | grep v10. || echo "Wrong node version"

# Ensure you have yarn install
yarn -v || echo "Yarn not installed"

# Ensure you can run lando.dev
lando.dev
```

* Activate the secret toggle

```bash
# Activate the secret toggle
lando.dev --secret-toggle

# Verify the toggle is on
lando.dev contrib:list || echo "\n\nSecret toggle not on"
```
