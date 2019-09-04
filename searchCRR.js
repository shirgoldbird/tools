const fs = require('fs-extra')
const program = require('commander')

const targets = [
    'https://github.com/azure/ocp-azure-quick-start',
    'https://github.com/azure/batchsparkscoringpredictiveaaintenance',
    'https://github.com/azure/azure-cosmos-dotnet-v3',
    'https://github.com/azure/azure-spatial-anchors-samples'
]
const { searchFromFolders } = require('./utils/search_util')

program.option('-p --basePath <basePath>', 'search folder path');
program.parse(process.argv);
searchFromFolders(program.basePath, searchMarkdowns, searchCRR);

function searchMarkdowns(searchPath) {
    return [`${searchPath}/.openpublishing.publish.config.json`];
}

async function searchCRR(file) {
    if (!fs.existsSync(file)) {
        return false;
    }
    const config = fs.readJSONSync(file, { encoding: 'utf-8' });
    var targetFound = false;
    if (config.dependent_repositories) {
        for (var i = 0; i < config.dependent_repositories.length; i++) {
            var crr = config.dependent_repositories[i];
            if (targets.indexOf(crr.url.toLowerCase()) >= 0) {
                console.log(`Found CRR ${crr.url}`);
                targetFound = true;
            }
        }
    }
    return targetFound;
}