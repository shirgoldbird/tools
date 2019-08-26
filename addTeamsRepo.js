const program = require('commander');
const fs = require('fs-extra');

const gitUrlParse = require('git-url-parse');
const Octokit = require('@octokit/rest');

(async () => {
    program
        .option('--githubToken <githubToken>', 'github token')
        .option('--list <list_file_path>', 'repository list file path')
        .option('--team <team_name>', 'teams name')
        .option('--org <org>', 'org name')
        .parse(process.argv);

    const repoList = getRepoList(program.list);

    let octokit = new Octokit({
        auth: `token ${program.githubToken}`,
    });

    let team = (await octokit.teams.getByName({
        org: program.org,
        team_slug: program.team
    })).data;

    for (var i = 0; i < repoList.length; i++) {
        const repo = gitUrlParse(repoList[i]);
        console.log(`Add repository '${repo.owner}/${repo.name}' to team '${program.team}'`);
        try {
            await octokit.teams.addOrUpdateRepo({
                team_id: team.id,
                owner: repo.owner,
                repo: repo.name,
                permission: 'push'
            });
        } catch (error) {
            console.error(error);
            continue;
        }
        console.log(`'${repo.owner}/${repo.name}' permission Granted`);
    }
})();

function getRepoList(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Repository list file '${filePath}' is not existed`);
    }
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