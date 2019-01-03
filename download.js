const { spawn } = require('child_process')
var program = require('commander')
var xlsx = require('xlsx')
var path = require('path')
var fs = require('fs-extra')

program
    .option('-t --token <token>', 'github token')
    .option('-l --list <list_file_path>', 'repository list file path')
    .option('-d --dest [dest]', 'folder path to download repositories, default to be "./dest"', './dest')
    .option('-f --force', 'force clone', false)
    .parse(process.argv);

var repoList = xlsx.utils.sheet_to_json(xlsx.readFile(program.list).Sheets["De-dup'ed"]);
cloneRepositories(repoList);

async function cloneRepositories(repos) {
    const parallelForEach = async (array, callback) => {
        var callbacks = []
        for (let index = 0; index < array.length; index++) {
            callbacks.push(callback(array[index], index, array.length - 1))
        }

        await Promise.all(callbacks)
    }

    await parallelForEach(repos, async (repo, count, total) => {
        cloneOneRepo(repo, program.dest, program.token, `[${repo.RepositoryName}]:`, program.force)
    })
}

function cloneOneRepo(repo, dest, token, prefix, force = false) {
    var clonePath = path.join(dest, repo.RepositoryName);
    if (fs.pathExists(clonePath)) {
        if (force) {
            fs.removeSync(clonePath);
        }
        else {
            console.warn(`${prefix} Repository already existed, skip clone`)
            return
        }
    }
    console.warn(`${prefix} start to clone`);

    var githubRepoUrl = `https://${token}:x-oauth-basic@` + repo.RepositoryURL.substr("https://".length)
    const git = spawn('git', ['clone', githubRepoUrl, clonePath]);

    git.on('close', (code) => {
        if (code != 0) {
            console.error(`${prefix} exec error with code: ${code}`);
        } else {
            console.log(`${prefix} clone finished`);
        }
    });
}
