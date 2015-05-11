#!/bin/bash

set -e

echo Current branch is $TRAVIS_BRANCH, pull request? $TRAVIS_PULL_REQUEST

function deploy() {
  local repo=$1
  local target_branch=$2
  local relative_path=$3
  local deployment_id=$4

  echo === Installing to $repo:$target_branch / $relative_path
  # $TRAVIS_BUILD_DIR
  # |- build/
  # |- deploy/
  # |- karma/
  # |- nodes_modules/
  # |- src/
  # |- ${repo}/
  # \- preserve.tar
  git clone git@github.com:passmaker/${repo}.git
  mkdir -p $TRAVIS_BUILD_DIR/${repo}/${relative_path}
  cd $TRAVIS_BUILD_DIR/${repo}/${relative_path}
  [ -f ./.keep ] && tar -cf $TRAVIS_BUILD_DIR/preserve.tar -T ./.keep
  rm -rf ./*
  cp -r $TRAVIS_BUILD_DIR/build/* .
  [ -f $TRAVIS_BUILD_DIR/preserve.tar ] && tar -xvf $TRAVIS_BUILD_DIR/preserve.tar
  cat > .version <<EOF
$deployment_id
$TRAVIS_COMMIT
EOF

  echo === Commit and push new version to $repo:$target_branch
  git config user.email "dudie.fr+github@gmail.com"
  git config user.name "dudie-ci"
  git checkout -B $target_branch
  git add --all
  git commit -m "Deploying $deployment_id"
  git push origin $target_branch
}

function prune() {
  local repo=$1
  local target_branch=$2

  #curl "https://api.github.com/repos/passmaker/passmaker-online/pulls?state=open"
  git clone git@github.com:passmaker/${repo}.git
  cd $repo
  git checkout -B $target_branch
  for deployment_descriptor in $(find $repo -type f -name '.version') ; do
    cat $deployment_descriptor
    # git rm -r $(basedir $deployment_descriptor)
    # git commit -m "Removing obsolete deployment"
  done
  git push origin $target_branch
  cd -
  rm -rf $repo
}

echo === Seting up auth keys
openssl aes-256-cbc -K $encrypted_707d6254d08c_key -iv $encrypted_707d6254d08c_iv -in deploy/id_passmaker.github.io.enc -out deploy/id_passmaker.github.io -d
chmod 400 deploy/id_passmaker.github.io
eval $(ssh-agent)
ssh-add deploy/id_passmaker.github.io
ssh-keyscan github.com >> ~/.ssh/known_hosts

if [ "X$TRAVIS_PULL_REQUEST" != "Xfalse" ] ; then
  prune dev gh-pages
  deploy dev gh-pages pull-request/$TRAVIS_PULL_REQUEST "pull-request: $TRAVIS_PULL_REQUEST"
elif [ "X$TRAVIS_BRANCH" != "Xproduction" ] ;then
  prune dev gh-pages
  deploy dev gh-pages $TRAVIS_BRANCH "branch: $TRAVIS_BRANCH"
else
  deploy passmaker.github.io master . "PassMaker $TRAVIS_COMMIT"
fi
