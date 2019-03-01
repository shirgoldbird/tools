var fs = require('fs-extra')
var glob = require('glob')
var path = require('path')
var program = require('commander')

const parallelForEach = async (array, callback) => {
    var callbacks = []
    for (let index = 0; index < array.length; index++) {
        callbacks.push(callback(array[index], index, array.length - 1))
    }

    await Promise.all(callbacks)
}

async function searchFromFolders(basePath, searchFromFile) {
    var result = [];
    var repoCount = 1;

    const dirs = fs.readdirSync(program.basePath).filter(f => fs.statSync(path.join(program.basePath, f)).isDirectory())
    dirs.forEach(async dir => {
        const files = glob.sync(
            path.join(basePath, dir, '**/*.yml'),
            {
                dot: true,
                ignore: '**/{TOC, toc, index}.yml'
            })
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
        if (Object.keys(itemCount).length > 0) {
            result.push({
                FolderName: dir,
                totalFileCount: files.length,
                itemCount
            })
        }
        if (repoCount == dirs.length) {
            console.log("search result:")
            result.forEach(item => {
                console.log(`${item.FolderName}:`)
                Object.keys(item.itemCount).forEach(key => {
                    console.log(`    ${key}: ${item.itemCount[key]}/${item.totalFileCount}`)
                })
            })
        }
        repoCount = repoCount + 1;
    })
}

module.exports.searchFromFolders = searchFromFolders