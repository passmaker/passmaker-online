#!/bin/bash

set -e

basedir=$(cd $(dirname $0) && pwd)/..

repo=$1          # target repository
target_branch=$2 # target branch
relative_path=$3 # a relative path to install into a subdirectory

workdir=$basedir/deploy/work

# $basedir
# |- build/
# |- deploy/
# |  \- work
# |     |- $repo/
# |     |  \- $relative_path/
# |     |- keep.tar
# |     \- keep_list
# |- karma/
# |- nodes_modules/
# \- src/

  #curl "https://api.github.com/repos/passmaker/passmaker-online/pulls?state=open"

git clone git@github.com:passmaker/${repo}.git $workdir/$repo
cd $workdir/$repo
git checkout -B $target_branch

echo === Removing obsolete deployments
active_branches=$(curl -s https://api.github.com/repos/passmaker/passmaker-online/branches | jq -r '.[].name')
current_deployments=$(find . -mindepth 2 ! -path './pull-request/*' -type f -name '.deployment' -exec dirname {} \+ | sed 's/\.\///g')

for deployment in $(comm -13 <(echo "$active_branches") <(echo "$current_deployments")) ; do
  echo "<<< Undeploy $deployment"
  git rm -r $workdir/$repo/$deployment
  git commit -m "Undeploy $deployment"
done

for prdeployment in $(find . -maxdepth 3 -path './pull-request/*' -type f -name '.deployment' -exec dirname {} \+ | sed 's/\.\///g') ; do
  id=$(basename $prdeployment)
  state=$(curl -s https://api.github.com/repos/passmaker/passmaker-online/pulls/$id | jq -r '.state')
  if [ "X$state" != "Xopen" ] ; then
    echo "<<< Undeploy PR #$id"
    git rm -r $prdeployment
    git commit -m "Undeploy $prdeployment"
  fi
done

echo === Deploying to github.com/passmaker/$repo

if [ -d $workdir/$repo/$relative_path ] ; then
  echo "<<< Uninstalling previous version"
  cd $workdir/$repo/$relative_path
  if [ -f .keep ] ; then
    cat .keep > $workdir/keep_list
    echo ".keep" >> $workdir/keep_list
    tar -cf $workdir/keep.tar -T $workdir/keep_list
  fi
  git rm -rf .
fi

echo ">>> Installing new version"
mkdir -p $workdir/$repo/$relative_path
cd $workdir/$repo/$relative_path
cp -r $basedir/build/* .
touch .deployment
[ -f $workdir/keep.tar ] && tar -xvf $workdir/keep.tar

git add --all
git status
git commit -m "Deploying $TRAVIS_BRANCH $TRAVIS_COMMIT"
git push origin $target_branch
