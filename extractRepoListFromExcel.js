#!/usr/bin/env node

const program = require('commander')
const xlsx = require('xlsx')
const fs = require('fs-extra')

program
    .arguments('<target>')
    .option('-o --output <filePath>', 'output file path')
    .option('--sheet-name [sheet-name]', 'the sheet name use which contains repository [default to be the first sheet]')
    .option('--attribute-name [attribute name]', 'the attribute name to extract [default to be `RepositoryURL`]')
    .action(function (target) {
        source = target;
    });

program.parse(process.argv);

if (!fs.existsSync(source)) {
    throw new Error('File is not existed');
}

if (fs.existsSync(program.output)) {
    throw new Error(`File ${program.output} is already existed`);
}

const workbook = xlsx.readFile(source);
const sheetName = program.sheetName || workbook.SheetNames[0];
const attributeName = program.attributeName || 'RepositoryURL';
const sheetContent = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
var repoList = [];
sheetContent.forEach(repo => {
    if (repo[attributeName]) {
        repoList.push(repo[attributeName]);
    }
})

fs.writeFileSync(program.output, repoList.join('\n'));