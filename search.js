var program = require('commander')
var fs = require('fs-extra')
var path = require('path')
var glob = require('glob')

program
    .arguments('<target>')
    .option('-p --basePath <basePath>', 'search folder path')
    .action(function (target) {
        searchTarget = target;
    })

program.parse(process.argv);

const dirs = fs.readdirSync(program.basePath).filter(f => fs.statSync(path.join(program.basePath, f)).isDirectory())
const parallelForEach = async (array, callback) => {
    var callbacks = []
    for (let index = 0; index < array.length; index++) {
        callbacks.push(callback(array[index], index, array.length - 1))
    }

    await Promise.all(callbacks)
}

searchFromFolders(program.basePath, dirs, searchTarget)

async function searchFromFolders(basePath, dirs, target) {
    var searchResult = [];
    var repoCount = 1;
    dirs.forEach(async dir => {
        const files = glob.sync(path.join(basePath, dir, '**/*.md'), { dot: true })
        console.log(`searching from folder ${dir}...`)
        // console.log(`${repoCount}/${dirs.length} searching from folder ${dir}...`)
        var searchCount = 0;
        await parallelForEach(files, async (file, count, total) => {
            var eof = count !== total ? '\r' : '\n'
            if (count % 100 == 0 || count == total) {
                process.stdout.write(`searching json ${count}/${total}${eof}`)
            }
            searchCount += searchFromFile(file, target)
        })
        searchResult.push({
            FolderName: path.basename(dir),
            totalFileCount: files.length,
            searchCount: searchCount
        })
        if (repoCount == dirs.length) {
            console.log("search result:")
            searchResult.forEach(item => {
                if(item.searchCount != 0){
                    console.log(`**** ${item.FolderName}: ${item.searchCount}/${item.totalFileCount}`)
                }else{
                    console.log(`${item.FolderName}: ${item.searchCount}/${item.totalFileCount}`)
                }
            })
        }
        repoCount = repoCount + 1;
    })
}

function searchFromFile(file, target) {
    var content = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
    if (content.indexOf(target) != -1) {
        return 1;
    }
    return 0;
}