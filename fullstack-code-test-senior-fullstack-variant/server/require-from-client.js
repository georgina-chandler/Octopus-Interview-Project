const path = require("path");

// This directory intentionally has no package.json/node_modules of its own
// — the project is set up so `cd client && pnpm install` is the only
// install step (see the root README). graphql and graphql-yoga are real
// dependencies of the basket server, not of the Next app, but they're
// installed as devDependencies of client/ and resolved from there
// explicitly, rather than via a second install step. A standalone
// deployment of this service would instead give it its own package.json
// and install.
function requireFromClient(moduleName) {
  const clientNodeModules = path.join(__dirname, "../client/node_modules");
  return require(require.resolve(moduleName, { paths: [clientNodeModules] }));
}

module.exports = { requireFromClient };
