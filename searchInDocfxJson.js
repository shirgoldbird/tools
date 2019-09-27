var program = require('commander')
var fs = require('fs-extra')
var glob = require('glob')
var path = require('path')

var { searchFromFolders } = require('./utils/search_util')

program
    .option('-p --basePath <basePath>', 'search folder path')
    .option('-w --searchWord <searchWord>', 'search key word')

program.parse(process.argv);

searchFromFolders(
    program.basePath,
    (searchPath) => {
        return glob.sync(
            path.join(searchPath, '**/docfx.json'), { dot: true })
    },
    async function (file) {
        var lines = fs.readFileSync(file, 'utf-8').replace(/^\uFEFF/, '').split('\r|\n').filter(_ => _);
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].indexOf(program.searchWord) > -1) {
                return lines.slice(i, i+3);
            }
        }
        
        return 0;
    })