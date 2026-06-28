const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseApiKey = process.env.SUPABASE_API_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl &&
    supabaseSecretKey &&
    supabaseUrl !== "https://seu-projeto.supabase.co" &&
    supabaseSecretKey !== "sua-secret-key"
);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseApiKey &&
    supabaseUrl !== "https://seu-projeto.supabase.co" &&
    supabaseApiKey !== "sua-chave-publica-ou-anon"
);

type QueryParams = Record<string, string | number | boolean | undefined>;

type SupabaseRequestInit = RequestInit & {
  params?: QueryParams;
  apiKey?: string;
};

function buildUrl(path: string, params?: QueryParams) {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL nao foi configurada.");
  }

  const url = new URL(`/rest/v1/${path}`, supabaseUrl);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

function buildRpcUrl(functionName: string) {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL nao foi configurada.");
  }

  return new URL(`/rest/v1/rpc/${functionName}`, supabaseUrl);
}

async function supabaseFetch<T>(path: string, init: SupabaseRequestInit = {}) {
  const { params, headers, apiKey: requestApiKey, ...requestInit } = init;
  const apiKey = requestApiKey ?? supabaseApiKey;
  if (!apiKey) {
    throw new Error("SUPABASE_API_KEY nao foi configurada.");
  }

  const response = await fetch(buildUrl(path, params), {
    ...requestInit,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Erro no Supabase (${response.status}): ${detail}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function callRpc<T>(functionName: string, body: unknown) {
  if (!supabaseApiKey) {
    throw new Error("SUPABASE_API_KEY nao foi configurada.");
  }

  const response = await fetch(buildRpcUrl(functionName), {
    method: "POST",
    headers: {
      apikey: supabaseApiKey,
      Authorization: `Bearer ${supabaseApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Erro no Supabase (${response.status}): ${detail}`);
  }

  return (await response.json()) as T;
}

export async function selectRows<T>(path: string, params?: QueryParams) {
  return supabaseFetch<T[]>(path, {
    method: "GET",
    params,
  });
}

export async function insertRows<T>(path: string, body: unknown) {
  return supabaseFetch<T[]>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateRows<T>(
  path: string,
  body: unknown,
  params?: QueryParams,
) {
  return supabaseFetch<T[]>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    params,
  });
}

function requireSecretKey() {
  if (!supabaseSecretKey) {
    throw new Error("SUPABASE_SECRET_KEY nao foi configurada.");
  }
  return supabaseSecretKey;
}

export async function selectAdminRows<T>(path: string, params?: QueryParams) {
  return supabaseFetch<T[]>(path, {
    method: "GET",
    params,
    apiKey: requireSecretKey(),
  });
}

export async function insertAdminRows<T>(path: string, body: unknown) {
  return supabaseFetch<T[]>(path, {
    method: "POST",
    body: JSON.stringify(body),
    apiKey: requireSecretKey(),
  });
}

export async function updateAdminRows<T>(
  path: string,
  body: unknown,
  params?: QueryParams,
) {
  return supabaseFetch<T[]>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    params,
    apiKey: requireSecretKey(),
  });
}