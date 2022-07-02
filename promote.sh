#!/bin/bash

# developの内容をmasterに反映させる

set -ex

echo "promote begin"
git checkout develop
git pull origin develop --ff-only         # check we are up to date on our branch
git checkout master        # go the target branch
git pull origin master --ff-only         # check updates there too
git merge develop --no-ff -m "merge from develop" # merge with a commit
git push origin master     # push the merge
git checkout develop
echo "promote done"
