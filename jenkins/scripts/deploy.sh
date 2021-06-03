#!/usr/bin/env sh

DOCKER_HOST='ssh://ubuntu@ubuntu'


docker-compose rm -f
docker-compose pull

echo "Spinning up containers..."
docker-compose up --build -d

echo "Pruning images..."
docker image prune -f

