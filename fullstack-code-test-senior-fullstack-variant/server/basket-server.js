const http = require("http");
const { requireFromClient } = require("./require-from-client");

const { createSchema, createYoga } = requireFromClient("graphql-yoga");

const { typeDefs } = require("./basket/schema");
const { resolvers } = require("./basket/resolvers");
const { getOrCreateSessionId } = require("./basket/session");

const PORT = process.env.PORT ?? 3002;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";
const GRAPHQL_ENDPOINT = "/graphql";

const schema = createSchema({ typeDefs, resolvers });

const yoga = createYoga({
  schema,
  graphqlEndpoint: GRAPHQL_ENDPOINT,
  // CORS and preflight are handled by the raw http.createServer listener
  // below instead (it needs to run before Yoga regardless, to attach the
  // session cookie), so Yoga's own built-in CORS handling is switched off
  // to avoid two different sets of Access-Control-* headers on one response.
  cors: false,
  context: async ({ sessionId }) => ({ sessionId }),
  // This resolver layer only ever throws deliberate, client-safe
  // GraphQLErrors for validation/not-found cases (see resolvers.js) — there
  // is nothing sensitive to mask here, and Yoga's default masking relies on
  // an `instanceof GraphQLError` check that isn't reliable across bundler
  // module boundaries (observed to misfire under Vitest). A schema with
  // resolvers that can throw real internal errors (e.g. a database driver)
  // should reinstate masking.
  maskedErrors: false,
});

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  // Cross-origin: the browser-hosted Next app (localhost:3000) and this
  // basket server (localhost:3002) are different origins, so the browser
  // enforces CORS on every request, including a preflight OPTIONS for the
  // POST+Content-Type GraphQL calls. Credentials: true + an explicit origin
  // (never "*") is required for the session cookie to be sent/received.
  res.setHeader("Access-Control-Allow-Origin", CLIENT_ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const { sessionId, setCookie } = getOrCreateSessionId(req.headers.cookie);
  if (setCookie) {
    res.setHeader("Set-Cookie", setCookie);
  }

  const body = req.method === "POST" ? await readRequestBody(req) : undefined;

  const response = await yoga.fetch(
    `http://localhost:${PORT}${req.url}`,
    {
      method: req.method,
      headers: req.headers,
      body,
    },
    { sessionId },
  );

  res.writeHead(
    response.status,
    // Combine Yoga's response headers with the CORS/cookie headers already
    // set on `res` above — Headers.forEach gives the final value per name,
    // and setHeader here only touches names Yoga's response actually sets.
    Object.fromEntries(response.headers.entries()),
  );
  res.end(Buffer.from(await response.arrayBuffer()));
});

server.listen(PORT, () => {
  console.log(`Basket GraphQL server running at http://localhost:${PORT}${GRAPHQL_ENDPOINT}`);
});
