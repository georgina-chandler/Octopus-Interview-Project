import { createSchema, createYoga } from "graphql-yoga";
import { resolvers } from "../../../lib/basket/resolvers";
import { typeDefs } from "../../../lib/basket/schema";
import { getOrCreateSessionId } from "../../../lib/basket/session";

const schema = createSchema({ typeDefs, resolvers });

// Note: deliberately not parameterizing createYoga<BasketContext> here —
// that generic types the *platform's* initial request context (what Next
// passes as the route handler's second argument), not the resolver
// context (which comes from the `context` factory below and is typed
// independently in resolvers.ts). Setting it would make Next's route-handler
// type-checker expect GET/POST's second argument to be BasketContext instead
// of { params: Promise<{}> }, which fails the build.
const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  // Server-rendered GraphiQL is handy in development; harmless to leave on
  // since this endpoint has no schema-level secrets, but a production
  // deployment would typically disable introspection/GraphiQL.
  context: async () => ({ sessionId: await getOrCreateSessionId() }),
  fetchAPI: { Response, Request },
  // This resolver layer only ever throws deliberate, client-safe
  // GraphQLErrors for validation/not-found cases (see resolvers.ts) — there
  // is nothing sensitive to mask here, and Yoga's default masking relies on
  // an `instanceof GraphQLError` check that isn't reliable across bundler
  // module boundaries. A schema with resolvers that can throw real internal
  // errors (e.g. a database driver) should reinstate masking.
  maskedErrors: false,
});

// Thin wrappers with an explicit (request: Request) => Promise<Response>
// signature, rather than exporting handleRequest directly: Yoga's own
// handler type exposes a second parameter (its platform-agnostic initial
// context) whose shape Next's generated route-handler validator rejects.
// We don't need that second argument here — the request's own session
// cookie is all the context resolvers need (see `context` above).
export async function GET(request: Request): Promise<Response> {
  return handleRequest(request, {});
}

export async function POST(request: Request): Promise<Response> {
  return handleRequest(request, {});
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handleRequest(request, {});
}
