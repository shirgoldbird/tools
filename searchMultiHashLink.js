const glob = require('glob')
const fs = require('fs-extra')
var path = require('path')
const program = require('commander')

const linkRegex = /\[([^\[\]]+)\]\(([^)\s]+)\)/g
const { searchFromFolders } = require('./utils/search_util')

program.option('-p --basePath <basePath>', 'search folder path');
program.parse(process.argv);
searchFromFolders(program.basePath, searchMarkdowns, getMultiHashLinks);

function searchMarkdowns(searchPath) {
    return glob.sync(
        path.join(searchPath, '**/*.md'),
        {
            dot: true,
            nodir: true
        })
}

async function getMultiHashLinks(file) {
    const result = [];
    console.log(`reading '${file}'...`);
    const content = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
    content.replace(
        linkRegex,
        function (match, label, href) {
            if (href.includes('##')) {
                result.push({ file: file, link: match });
            }
            return match;
        });
    return result.length === 0 ? 0 : JSON.stringify(result);    
}