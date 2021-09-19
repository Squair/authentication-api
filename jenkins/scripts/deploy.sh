#!/usr/bin/env sh

DOCKER_HOST='ssh://ubuntu@ubuntu' docker-compose rm -f
DOCKER_HOST='ssh://ubuntu@ubuntu' docker-compose pull

echo "Spinning up containers..."
DOCKER_HOST='ssh://ubuntu@ubuntu' docker-compose up --build -d

echo "Pruning images..."
DOCKER_HOST='ssh://ubuntu@ubuntu' docker image prune -f

