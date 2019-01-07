const gh = require('parse-github-url')

class Repository {
    constructor(repositoryUrl, tokens) {
        var repository_info = gh(repositoryUrl);
        this.repoOwner = repository_info.owner;
        this.repoName = repository_info.name;
        if (this.isGithubRepository(repositoryUrl)) {
            this.isGithubRepo = true;
            this.repositoryUrlWithToken = `https://${tokens.githubToken}:x-oauth-basic@` + repositoryUrl.substr("https://".length)
        } else if(this.isVSTSRepository(repositoryUrl)){
            this.isVSTSRepo = true;
            this.repositoryUrlWithToken = `https://${tokens.vstsToken}:x-oauth-basic@` + repositoryUrl.substr("https://".length)
        }
    }

    isGithubRepository(url) {
        return /https:\/\/github.com\/.*$/.test(url)
    }

    isVSTSRepository(url) {
        return /https:\/\/.*\.visualstudio.com\/.*$/.test(url)
    }
}

exports.Repository = Repository;