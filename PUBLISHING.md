# Publishing

Publishing to NPM is automated through GitHub Actions and GitHub Releases.

To publish a new version to NPM:
1. Raise and merge a PR with the new version number (example: https://github.com/CDThomas/graphql-json-to-sdl/pull/33)
1. Wait for the [Release Drafter](https://github.com/CDThomas/graphql-json-to-sdl/blob/master/.github/workflows/release-drafter.yml) workflow to run
1. Go to the [releases page](https://github.com/CDThomas/graphql-json-to-sdl/releases) and edit the draft release
1. Verify that the title and tag names are correct (note: the tag will be created when the release is published)
1. Click on "Publish release"
