# leveraging the npm-publish-action

This workflow leverages the [pascalgn/npm-publish-action](https://github.com/pascalgn/npm-publish-action) to automatically publish packages to npm.

Visit the repo for more details.

## Usage

Change the version in `package.json` and push a commit with the message `Release N.N.N`, the `npm-publish` action will create a new tag `vN.N.N` and publish the package to the npm registry.

Tests will run upon a push to any branch; however, only pushes to the `main` branch with the above `commit message` syntax will trigger the workflow to publish the npm package.

### Environment variables

- `GITHUB_TOKEN`: this is a token that GitHub generates automatically, you only need to pass it to the action as in the example
- `NPM_AUTH_TOKEN`: this is the token the action will use to authenticate to [npm](https://npmjs.com). You need to generate one in npm, then you can add it to your secrets (settings -> secrets) so that it can be passed to the action. DO NOT put the token directly in your workflow file.
