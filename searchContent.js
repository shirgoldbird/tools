var program = require('commander')
var fs = require('fs-extra')

var { searchFromFolders } = require('./utils/search_util')

program
    .arguments('<target>')
    .option('-p --basePath <basePath>', 'search folder path')
    .action(function (target) {
        searchTarget = target;
    })

program.parse(process.argv);

searchFromFolders(program.basePath, function (file) {
    var content = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
    if (content.indexOf(searchTarget) != -1) {
        return searchTarget;
    }
    return 0;
})