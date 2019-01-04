function appendTokenToRepoUrl(url, githubToken, vstsToken) {
    if (isGithubRepo(url)) {
        return `https://${githubToken}:x-oauth-basic@` + url.substr("https://".length)
    } else if (isVSTSRepo(url) && vstsToken) {
        return `https://${vstsToken}:x-oauth-basic@` + url.substr("https://".length)
    }
    return url;
}

function isGithubRepo(url) {
    return /https:\/\/github.com\/.*$/.test(url)
}

function isVSTSRepo(url) {
    return /https:\/\/.*\.visualstudio.com\/.*$/.test(url)
}

module.exports.appendTokenToRepoUrl = appendTokenToRepoUrl
module.exports.isGithubRepo = isGithubRepo
module.exports.isVSTSRepo = isVSTSRepo