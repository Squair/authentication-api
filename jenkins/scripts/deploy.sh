#!/usr/bin/env sh

echo "Building docker compose..."
docker-compose build

echo "Spinning up containers..."
docker-compose up -d
