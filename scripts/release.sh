#!/bin/bash

export SLUG=ghcr.io/awakari/webapp
export VERSION=$(git describe --tags --abbrev=0 | cut -c 2-)
echo "Releasing version: $VERSION"
docker tag awakari/webapp "${SLUG}":"${VERSION}"
docker push "${SLUG}":"${VERSION}"
