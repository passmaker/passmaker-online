#!/bin/bash -x

set -e

echo Current branch is $TRAVIS_BRANCH, pull request? $TRAVIS_PULL_REQUEST

if [ "X$TRAVIS_BRANCH" != "Xproduction" ] || [ "X$TRAVIS_PULL_REQUEST" != "Xfalse" ] ; then
  echo skipping deployment
  exit 0
fi

echo === Seeting up auth keys
openssl aes-256-cbc -K $encrypted_707d6254d08c_key -iv $encrypted_707d6254d08c_iv -in deploy/id_passmaker.github.io.enc -out deploy/id_passmaker.github.io -d
chmod 400 deploy/id_passmaker.github.io
eval $(ssh-agent)
ssh-add deploy/id_passmaker.github.io

echo === Installing
# .
# |- build/
# |- deploy/
# |- karma/
# |- nodes_modules/
# |- src/
# |- passmaker.github.io/
# \- preserve.tar
ssh-keyscan github.com >> ~/.ssh/known_hosts
git clone git@github.com:passmaker/passmaker.github.io.git
cd passmaker.github.io
tar -cf ../preserve.tar -T ../deploy/preserve
rm -rf ./*
cp -r ../build/* .
tar -xvf ../preserve.tar

echo === Commit and push new version
git config user.email "dudie.fr+github@gmail.com"
git config user.name "dudie-ci"
#git checkout -b release/$REV
git add --all
git commit -m "Deploying PassMaker $TRAVIS_COMMIT"
#git push origin release/$REV
git push origin master
