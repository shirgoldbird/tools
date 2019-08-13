var program = require('commander')
var fs = require('fs-extra')
var glob = require('glob')
var path = require('path')
var Q = require('q');

var { searchFromFolders } = require('./utils/search_util')

program
    .option('-p --basePath <basePath>', 'search folder path')

program.parse(process.argv);

const supportedSchemas = [
    'contentbrowser',
    'hub',
    'landing',
    'localelist',
    'tutorial',
    'twitter',
    'contextobject',
    'emailoptinpreferences',
    'formmodel',
    'zonepivotgroups',
];

searchFromFolders(
    program.basePath,
    (searchPath) => {
        return glob.sync(
            path.join(searchPath, '**/*.yml'),
            {
                dot: true,
                ignore: '**/{TOC,toc}.yml'
            })
    },
    async function (file) {
        var firstLineContent = await readFirstLine(file);
        var content = firstLineContent.replace(/^\uFEFF/, '')

        if (content.startsWith('### YamlMime:')) {
            let schema = content.substr('### YamlMime:'.length).trim();
            if (supportedSchemas.includes(schema.toLowerCase())) {
                return schema;
            }
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