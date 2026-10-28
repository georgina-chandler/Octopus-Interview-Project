interface GraphQLResponse<TData> {
  data?: TData;
  errors?: { message: string }[];
}

export async function fetchGraphQL<
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  endpoint: string,
  query: string,
  variables?: TVariables,
  init?: RequestInit,
): Promise<TData> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    ...init,
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed with status ${res.status}`);
  }

  const json: GraphQLResponse<TData> = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join("; "));
  }

  if (!json.data) {
    throw new Error("GraphQL response contained no data");
  }

  return json.data;
}
