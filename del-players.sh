#!/usr/bin/env bash

mkdir ../ranvier-backups/
sudo rm ../ranvier-backups/*.json
cp data/players/*.json ../../../ranvier-backups/*.json
echo "Copied players to backup dir..."
sudo rm data/players/*.json
echo "Deleted players!"
