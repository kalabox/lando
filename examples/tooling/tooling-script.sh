#!/bin/bash

# Set default opts
WORD="bird"
VERBOSE=0

# The original command passed to the tooling script.
ORIGINAL_ARGS="$@"

# PARSE THE ARGZZ
# TODO: compress the mostly duplicate code below?
POSITIONAL=""
while (( "$#" )); do
  case "$1" in
    -w|--word|--word=*)
      if [ "${1##--word=}" != "$1" ]; then
        WORD="${1##--word=}"
        shift
      else
        WORD=$2
        shift 2
      fi
      ;;
    -v|-vv|-vvv|-vvvv|--verbose)
      echo "Running tooling script in verbose mode" >&2
      VERBOSE=1
      shift
      ;;
    --)
      shift
      POSITIONAL="$POSITIONAL $@"
      break
      ;;
    -*|--*=)
      echo "Error: Unsupported flag $1" >&2
      exit 1
      ;;
    *)
      POSITIONAL="$POSITIONAL $1"
      shift
      ;;
  esac
done

# restore positional parameters
eval set -- "$POSITIONAL"

# Demonstrate option processing by printing the word and amount of positional arguments.
echo -n "WORD=$WORD args=$#"

# Print the remaining positional arguments.
if [ $# -gt 0 ]; then
  echo ": $@"
fi

if [ $VERBOSE = 1 ]; then
  echo "original tooling args: $ORIGINAL_ARGS"
fi
