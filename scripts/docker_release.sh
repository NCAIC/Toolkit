#!/bin/sh
version=$(git describe --tags --abbrev=0)
docker buildx build --push --platform linux/arm64/v8,linux/amd64 -t "jacoblincool/ncaic:$version" -t jacoblincool/ncaic:latest .
