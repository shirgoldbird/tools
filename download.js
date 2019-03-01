#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const fs = require('fs-extra')
const parallelRun = require('./utils/parallel.js')
const { Repository } = require('./utils/repository.js')

program
    .option('--githubToken <githubToken>', 'github token')
    .option('--vstsToken <vstsToken>', 'vsts token')
    .option('--cloneVSTSRepo', 'clone vsts repo, default to be false', false)
    .option('-l --list <list_file_path>', 'repository list file path')
    .option('-d --dest [dest]', 'folder path to download repositories, default to be "./dest"', './dest')
    .option('-f --force', 'force clone', false)
    .option('--workerNumber', 'number of workers, default to be 4', 4)
    .parse(process.argv);

var repoList = getRepoList(program.list)

cloneRepositories(repoList, program.dest, program.githubToken, program.vstsToken, program.cloneVSTSRepo, program.workerNumber, program.force);

function cloneRepositories(repos, dest, githubToken, vstsToken, cloneVSTSRepo, workerNumber, force) {
    var commands = []
    repos.forEach(repo => {
        var repository = new Repository(repo, {
            githubToken: githubToken,
            vstsToken: vstsToken
        });
        var clonePath = path.resolve(path.join(dest, repository.repoOwner, repository.repoName));
        if (fs.pathExistsSync(clonePath)) {
            if (force) {
                fs.removeSync(clonePath);
            }
            else {
                console.log(`Repository ${repository.repoOwner}/${repository.repoName} already existed, skip clone`)
                return
            }
        }

        if (repository.isGithubRepo) {
            commands.push({
                command: `git clone ${repository.repositoryUrlWithToken} "${clonePath}"`,
                name: `${repository.repoOwner}/${repository.repoName}`
            })
        } else if (repository.isVSTSRepo && cloneVSTSRepo) {
            commands.push({
                command: `git clone ${repository.repositoryUrlWithToken} "${clonePath}"`,
                name: `${repository.repoOwner}/${repository.repoName}`
            })
        }
    });
    parallelRun(commands, workerNumber);
}

function getRepoList(filePath) {
    var repoList = [];
    fs.readFileSync(filePath, 'utf-8')
        .split('\n')
        .forEach(repo => {
            repo = repo.trim();
            if (repo) {
                repoList.push(repo);
            }
        });

    return repoList;
}