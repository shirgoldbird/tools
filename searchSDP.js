var program = require('commander')
var fs = require('fs-extra')
var Q = require('q');

var { searchFromFolders } = require('./utils/search_util')

program
    .option('-p --basePath <basePath>', 'search folder path')

program.parse(process.argv);

searchFromFolders(program.basePath, async function (file) {
    var firstLineContent = await readFirstLine(file);
    var content = firstLineContent.replace(/^\uFEFF/, '')

    if (content.startsWith('### YamlMime:')) {
        return content.substr('### YamlMime:'.length)
    }
    return 0;
})

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