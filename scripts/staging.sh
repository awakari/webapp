#!/bin/bash

export SLUG=ghcr.io/awakari/webapp
export VERSION=latest
docker tag awakari/webapp "${SLUG}":"${VERSION}"
docker push "${SLUG}":"${VERSION}"
