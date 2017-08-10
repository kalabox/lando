#!/bin/bash

set -e

# Set up our things
SSH_CONF="/etc/ssh"
SSH_DIRS=( "/user/.ssh" "/user/.lando/keys" )
SSH_CANDIDATES=()
SSH_KEYS=()
SSH_IDENTITIES=()

# Set defaults
: ${LANDO_WEBROOT_USER:='www-data'}
: ${LANDO_WEBROOT_GROUP:='www-data'}

# Make sure we have the system wide confdir
mkdir -p $SSH_CONF

# Scan the following directories for keys
for SSH_DIR in "${SSH_DIRS[@]}"; do
  echo "Scanning $SSH_DIR for keys..."
  mkdir -p $SSH_DIR
  chown -R $LANDO_WEBROOT_USER:$LANDO_WEBROOT_GROUP $SSH_DIR
  SSH_CANDIDATES+=($(find "$SSH_DIR" -maxdepth 1 -not -name '*.pub' -not -name 'known_hosts' -type f | xargs))
done

# Filter out non private keys or keys that are password ENCRYPTED
for SSH_CANDIDATE in "${SSH_CANDIDATES[@]}"; do
  echo "Checking whether $SSH_CANDIDATE is a private key..."
  if grep -L "PRIVATE KEY" $SSH_CANDIDATE &> /dev/null; then
    echo "Checking whether $SSH_CANDIDATE does not have a passphrase..."
    if ! grep -L ENCRYPTED $SSH_CANDIDATE &> /dev/null; then
      SSH_KEYS+=($SSH_CANDIDATE)
      SSH_IDENTITIES+=("  IdentityFile $SSH_CANDIDATE")
    fi
  fi
done

# Make sure the keys have the correct permissions
for SSH_KEY in "${SSH_KEYS[@]}"; do
  echo "Ensuring permissions for $SSH_KEY..."
  chmod 700 $SSH_KEY
done

# Log
echo "Using the following keys: ${SSH_KEYS[@]}"

# Construct the ssh_config
OLDIFS="${IFS}"
IFS=$'\n'
cat > $SSH_CONF/ssh_config <<EOF
Host *
  StrictHostKeyChecking no
  UserKnownHostsFile=/dev/null
  LogLevel=ERROR
${SSH_IDENTITIES[*]}
EOF
IFS="${OLDIFS}"
