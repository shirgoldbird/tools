const fs = require('fs-extra')
const path = require('path')
const git = require('simple-git/promise')
const program = require('commander')

const targets = [
    'https://github.com/azure/ocp-azure-quick-start',
    'https://github.com/azure/batchsparkscoringpredictiveaaintenance',
    'https://github.com/azure/azure-cosmos-dotnet-v3',
    'https://github.com/azure/azure-spatial-anchors-samples'
]

program.option('-p --basePath <basePath>', 'search folder path');
program.parse(process.argv);

(async () => {
    const repo = await git(program.basePath);
    const branchs = (await repo.branch()).all;
    const configFilePath = path.join(program.basePath, '.openpublishing.publish.config.json');
    const result = {}
    for (i = 0; i < branchs.length; i++) {
        const branch = branchs[i];
        console.log(`Checkout to branch '${branch}'`);
        await repo.checkout(branch);
        result[branch] = [];

        if (!fs.existsSync(configFilePath)) {
            console.log(`Config file is not existed.`);
            continue;
        }
        const config = fs.readJSONSync(configFilePath, { encoding: 'utf-8' });
        var targetFound = false;
        if (config.dependent_repositories) {
            for (var j = 0; j < config.dependent_repositories.length; j++) {
                var crr = config.dependent_repositories[j];
                if (targets.indexOf(crr.url.toLowerCase()) >= 0) {
                    console.log(`Found CRR ${crr.url}`);
                    targetFound = true;
                    result[branch].push(crr.url);
                }
            }
        }
        if (!targetFound) {
            console.log(`No CRR match the target`);
        }
    }

    console.log('============================')
    console.log('# Here is the search report:')
    console.log('------')
    console.log(`  ## There are ${Object.keys(result).length} branch founded, here are the detail:`)

    Object.entries(result).forEach(([key, value]) => {
        console.log(`  ${key}:`);
        if (value.length == 0) {
            console.log('    Nothing Found')
        }
        value.forEach(item => {
            console.log(`    - ${item}`);
        })
    })
})();
