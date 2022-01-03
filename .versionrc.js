module.exports = {
  bumpFiles: [
    {
      filename: "package.json",
      type: "json"
    },
  ],
  releaseCommitMessageFormat: "release v{{currentTag}}",
  preset: "conventional-changelog-conventionalcommits",
  skip: {
    commit: false,
  },
  noVerify: true
}