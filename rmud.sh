#!/usr/bin/env bash
echo "Spinning up test server with short respawn time..."
sudo ./ranvier -v --save=2 --respawn=10
