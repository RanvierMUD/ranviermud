#!/usr/bin/env bash

function timestamp () {
  date +"%T"
}
echo "Backing up at $(timestamp)"
mkdir ../ranvier-backups/$(timestamp)/
cp data/players/*.json ../ranvier-backups/$(timestamp)/
