#!/usr/bin/env node

/*
 * `git pull` all the repos already cloned by `download.js`
 */

const { execSync } = require('child_process');
const glob = require('glob')
const program = require('commander')

program.option('-p --basePath <basePath>', 'search folder path');
program.parse(process.argv);
const repoFolders = glob.sync(`${program.basePath}/*/*`, { dot: true })
console.log(`Found ${repoFolders.length} git folder under the search destination`);

repoFolders.forEach(dir => {
    console.log(`Pulling '${dir}'...`);
    execSync('git reset --hard HEAD', { cwd: dir });
    execSync('git pull', { cwd: dir });
    console.log(`Finish pulling '${dir}'`);
})