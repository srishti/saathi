#!/usr/bin/env bash

# define globals
PURPLE='\033[0;35m'
CYAN='\033[0;36m'

# change node version
echo -e "${PURPLE}Starting the LOCAL release for Saathi"
echo -e "${PURPLE}Changing node version to 16.14.0"
source ~/.nvm/nvm.sh
nvm use 16.14.0 || exit

# get changes to publish
echo -e "${PURPLE}Current Path: ${CYAN}$PWD${PURPLE}"
cur_branch=$(git symbolic-ref --short HEAD)
echo -e "${PURPLE}Current branch: ${CYAN}$cur_branch${PURPLE}"

# install dependencies
echo -e "${PURPLE}Installing dependencies from package.json"
npm install

# release new version
echo -e "${PURPLE}Checking the last saved Saathi version in Verdaccio storage"
latest_saathi_version=`ls -t ~/.config/verdaccio/storage/@meesho/saathi | grep "saathi-" | head -n 1`
echo -e "${PURPLE}Latest Saathi version in Verdaccio storage is: ${CYAN}$latest_saathi_version${PURPLE}"
read -p "Please input the version to be published " version_to_publish
echo -e "${PURPLE}Bumping up the version"
npm run bump:version -- --release-as $version_to_publish --skip.commit --skip.tag --skip.changelog || exit

# generate build
echo -e "${PURPLE}Building Saathi"
rm -rf ../dist/
npm run build || exit

# push changes to remote
echo -e "${PURPLE}Pushing tags to remote origin"
git push --tags
echo -e "${PURPLE}Pushing the bumped up version to origin"
git push origin master
echo -e "${PURPLE}Successfully pushed tags and all changes to origin in remote"

# publish bundle
echo -e "${PURPLE}Moving inside build folder"
cd dist
echo -e "${PURPLE}Publishing Saathi"
npm publish
echo -e "${PURPLE}Moving to root level"
cd ..
echo -e "${PURPLE}Current Path: ${CYAN}$PWD${PURPLE}"
echo -e "${PURPLE}Successfully published the new version ${CYAN}${version_to_publish}. Enjoy!"