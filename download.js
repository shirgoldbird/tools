const program = require('commander')
const xlsx = require('xlsx')
const path = require('path')
const fs = require('fs-extra')
const parallelRun = require('./utils/parallel.js')
const { appendTokenToRepoUrl, isVSTSRepo } = require('./utils/httpHelper.js')

program
    .option('--githubToken <githubToken>', 'github token')
    .option('--vstsToken <vstsToken>', 'vsts token')
    .option('--skipVSTSRepo', 'skip vsts repo, default to be false', false)
    .option('-l --list <list_file_path>', 'repository list file path')
    .option('-d --dest [dest]', 'folder path to download repositories, default to be "./dest"', './dest')
    .option('-f --force', 'force clone', false)
    .option('--workerNumber', 'number of workers, default to be 4', 4)
    .parse(process.argv);

var workbook = xlsx.readFile(program.list);
var repoList = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
cloneRepositories(repoList, program.dest, program.githubToken, program.vstsToken, program.skipVSTSRepo, program.workerNumber, program.force);

function cloneRepositories(repos, dest, githubToken, vstsToken, skipVSTSRepo, workerNumber, force) {
    var commands = []
    repos.forEach(repo => {
        var repositoryName = path.basename(repo.RepositoryURL)
        var clonePath = path.resolve(path.join(dest, repositoryName));
        if (fs.pathExistsSync(clonePath)) {
            if (force) {
                fs.removeSync(clonePath);
            }
            else {
                console.log(`Repository ${repositoryName} already existed, skip clone`)
                return
            }
        }
        if (isVSTSRepo(repo.RepositoryURL) && skipVSTSRepo) {
            return
        }

        commands.push({
            command: `git clone ${appendTokenToRepoUrl(repo.RepositoryURL, githubToken, vstsToken)} "${clonePath}"`,
            name: repositoryName
        })
    });
    parallelRun(commands, workerNumber);
}