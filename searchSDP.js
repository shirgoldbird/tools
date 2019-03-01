var program = require('commander')
var fs = require('fs-extra')
var Q = require('q');
var path = require('path')
var glob = require('glob')

program
    .option('-p --basePath <basePath>', 'search folder path')

program.parse(process.argv);

const dirs = fs.readdirSync(program.basePath).filter(f => fs.statSync(path.join(program.basePath, f)).isDirectory())
const parallelForEach = async (array, callback) => {
    var callbacks = []
    for (let index = 0; index < array.length; index++) {
        callbacks.push(callback(array[index], index, array.length - 1))
    }

    await Promise.all(callbacks)
}

searchFromFolders(program.basePath, dirs)

async function searchFromFolders(basePath, dirs) {
    var result = [];
    var repoCount = 1;
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
        if (itemCount != []) {
            result.push({
                FolderName: path.basename(dir),
                totalFileCount: files.length,
                itemCount
            })
        }
        if (repoCount == dirs.length) {
            console.log("search result:")
            result.forEach(item => {
                console.log(`${item.FolderName}:`)
                item.itemCount.forEach((key, value) => {
                    console.log(`    ${key}: ${value}/${item.totalFileCount}`)
                })
            })
        }
        repoCount = repoCount + 1;
    })
}

async function searchFromFile(file) {
    var firstLineContent = await readFirstLine(file);
    var content = firstLineContent.replace(/^\uFEFF/, '')

    if (content.startsWith('### YamlMime:')) {
        return content.substr('### YamlMime:'.length)
    }
    return 0;
}

function readFirstLine(path) {
    return Q.promise(function (resolve, reject) {
        var rs = fs.createReadStream(path, { encoding: 'utf8' });
        var acc = '';
        var pos = 0;
        var index;
        rs
            .on('data', function (chunk) {
                index = chunk.indexOf('\n');
                acc += chunk;
                index !== -1 ? rs.close() : pos += chunk.length;
            })
            .on('close', function () {
                resolve(acc.slice(0, pos + index));
            })
            .on('error', function (err) {
                reject(err);
            })
    });
}