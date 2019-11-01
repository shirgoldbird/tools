# download.js - clone all the repository to local machine
```bash
$ node download.js --githubToken xxx --list MicrosoftDocs-repos.txt --dest {DestFolder}
```

# update.js - pull the latest content
```bash
$ node update.js -p dest
```

# searchContent.js - Search a string from all the markdown file
```bash
node searchContent.js "layout: HubPage" -p dest
```