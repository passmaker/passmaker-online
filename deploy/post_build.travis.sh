#!/bin/bash

set -e

echo === Current branch is $TRAVIS_BRANCH, pull request? $TRAVIS_PULL_REQUEST

git config --global user.email "dudie.fr+github@gmail.com"
git config --global user.name "dudie-ci"

echo === Setting up auth keys
openssl aes-256-cbc -K $encrypted_707d6254d08c_key -iv $encrypted_707d6254d08c_iv -in deploy/id_passmaker.github.io.enc -out deploy/id_passmaker.github.io -d
chmod 400 deploy/id_passmaker.github.io
eval $(ssh-agent)
ssh-add deploy/id_passmaker.github.io
ssh-keyscan github.com >> ~/.ssh/known_hosts

if [ "X$TRAVIS_PULL_REQUEST" != "Xfalse" ] ; then
  ./deploy/deploy_to_repository.sh dev gh-pages pull-request/$TRAVIS_PULL_REQUEST
elif [ "X$TRAVIS_BRANCH" != "Xmaster" ] ;then
  ./deploy/deploy_to_repository.sh dev gh-pages $TRAVIS_BRANCH
else
  ./deploy/deploy_to_repository.sh passmaker.github.io master .
fi
