const glob = require('glob')
const path = require('path')
const git = require('simple-git/promise')

const parallelForEach = async (array, callback) => {
    var callbacks = []
    for (let index = 0; index < array.length; index++) {
        callbacks.push(callback(array[index], index + 1, array.length))
    }

    await Promise.all(callbacks)
}

async function searchFromFolders(basePath, searchGlob, searchFromFile) {
    var result = [];
    var repoCount = 1;

    const gitFolders = glob.sync(`${basePath}/**/.git/`, { dot: true }).map(item => item.substring(basePath.length + 1, item.length - 6))
    console.log(`Found ${gitFolders.length} git folder under the search destination`);
    gitFolders.forEach(async dir => {
        const files = searchGlob(path.join(basePath, dir));
        console.log(`searching from folder ${dir}...`)
        var itemCount = {};
        await parallelForEach(files, async (file, count, total) => {
            var eof = count !== total ? '\r' : '\n'
            if (count % 100 == 0 || count == total) {
                process.stdout.write(`searching json ${count}/${total}${eof}`)
            }
            var fileSearchResult = await searchFromFile(file);
            if (fileSearchResult) {
                if (itemCount[fileSearchResult]) {
                    itemCount[fileSearchResult]++;
                } else {
                    itemCount[fileSearchResult] = 1;
                }
            }
        })
        result.push({
            folderName: dir,
            repositoryUrl: (await git(path.join(basePath, dir)).listRemote(['--get-url'])).trim(),
            totalFileCount: files.length,
            itemCount
        })

        if (repoCount == gitFolders.length) {
            generateReport(result, gitFolders);
        }
        repoCount = repoCount + 1;
    })
}

function generateReport(result, gitFolders) {
    const foundItems = result.filter(item => {
        return Object.keys(item.itemCount).length > 0;
    });

    console.log('============================')
    console.log('# Here is the search report:')
    console.log('------')
    console.log(`  ## There are ${gitFolders.length} git folder founded in the search destination folder, here is all the their repository urls:`)
    result.forEach(item => {
        console.log(`    ${item.repositoryUrl}`)
    })

    console.log('------')
    console.log('  ## Here are the repositories which contains the search target:')
    foundItemss.forEach(item => {
        console.log(`    ${item.repositoryUrl}`)
    })

    console.log('------')
    console.log('  ## Here is the detail search result:')
    foundItems.forEach(item => {
        console.log(`    ${item.folderName}(${item.repositoryUrl}):`)
        Object.keys(item.itemCount).forEach(key => {
            console.log(`      ${key}: ${item.itemCount[key]}/${item.totalFileCount}`)
        })
    })
}

module.exports.searchFromFolders = searchFromFolders