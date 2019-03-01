async function searchFromFolders(basePath, dirs, searchFunc) {
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
            searchCount += searchFunc(file)
        })
        searchResult.push({
            FolderName: path.basename(dir),
            totalFileCount: files.length,
            searchCount: searchCount
        })
        if (repoCount == dirs.length) {
            console.log("search result:")
            searchResult.forEach(item => {
                if (item.searchCount != 0) {
                    console.log(`**** ${item.FolderName}: ${item.searchCount}/${item.totalFileCount}`)
                } else {
                    console.log(`${item.FolderName}: ${item.searchCount}/${item.totalFileCount}`)
                }
            })
        }
        repoCount = repoCount + 1;
    })
}

module.exports.searchFromFolders = searchFromFolders;