const fs = require('fs')
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

    const gitFolders = glob.sync(`${basePath}/*/*/.git/`, { dot: true }).map(item => path.dirname(item));
    console.log(`Found ${gitFolders.length} git folder under the search destination`);
    for await ( const dir of gitFolders ) {
        const files = searchGlob(dir);
        console.log(`searching from folder ${dir}...`)
        var itemCount = 0;
        var searchTerm = '';
        var filesFound = [];
        await parallelForEach(files, async (file, count, total) => {
            var eof = count !== total ? '\r' : '\n'
            if (count % 100 == 0 || count == total) {
                process.stdout.write(`searching json ${count}/${total}${eof}`)
            }
            var fileSearchResult = await searchFromFile(file);
            if (fileSearchResult) {
                itemCount++;
                searchTerm = fileSearchResult;
                filesFound.push(file);
            }
        })
        result.push({
            folderName: dir,
            repositoryUrl: (await git(dir).listRemote(['--get-url'])).trim(),
            totalFileCount: files.length,
            itemCount,
            filesFound,
            searchTerm
        })

        if (repoCount == gitFolders.length) {
            generateReport(result, gitFolders);
        }
        repoCount = repoCount + 1;
    }
}

function generateReport(result, gitFolders) {
    const foundItems = result.filter(item => {
        return item.itemCount > 0;
    });

    console.log('============================')
    console.log('# Search Report:')
    console.log('------')
    console.log(`  ## There were ${gitFolders.length} folders searched:`)
    result.forEach(item => {
        console.log(`    ${item.folderName} (URL: ${item.repositoryUrl})`)
    })

    if (foundItems.length > 0) {
    console.log('------')
        console.log(`  ## ${foundItems.length} folders contained the search target.`)
    
        console.log('  ## Detailed search results:')
    foundItems.forEach(item => {
            console.log(`    ${item.folderName}:`)
            console.log(`        ${item.itemCount}/${item.totalFileCount} files contained "${item.searchTerm}"`)
    })

        const currTime = getDateString();
    
        fs.writeFileSync(`output-${currTime}.json`, JSON.stringify(result, null, "\t"));
        console.log(`Search results have been written to output-${currTime}.json`);
    } else {
        console.log("No folders contained the search target.")
    }
}

function getDateString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hour = date.getHours();
    return `${year}-${month}-${day}T${hour}_${minutes}_${seconds}`
}

module.exports.searchFromFolders = searchFromFolders