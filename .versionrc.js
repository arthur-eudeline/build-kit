module.exports = {
  bumpFiles: [
    {
      filename: "package.json",
      type: "json"
    },
  ],
  // Skip CI allows to skip github actions for this commit
  releaseCommitMessageFormat: "release v{{currentTag}}\n[skip ci]",
  preset: "conventional-changelog-conventionalcommits",
  skip: {
    commit: false,
  },
  noVerify: true
}