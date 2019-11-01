const fs = require('fs-extra')
const glob = require('glob')
const path = require('path')
const program = require('commander')

var { searchFromFolders } = require('./utils/search_util')

program
    .arguments('<target>')
    .option('-p --basePath <basePath>', 'search folder path')
    .action(function (target) {
        searchTarget = target;
    })

program.parse(process.argv);

searchFromFolders(
    program.basePath,
    (searchPath) => {
        return glob.sync(
            path.join(searchPath, '**/*.md'),
            {
                dot: true,
                nodir: true
            })
    },
    function (file) {
        var content = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
        if (content.indexOf(searchTarget) != -1) {
            return searchTarget;
        }
        return 0;
    })