const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const key = Deno.env.get("NAIJARESULTSPIN_API_KEY") ?? "";
  const url = new URL(req.url);
  const path = url.searchParams.get("path") ?? "";
  const target = `https://www.naijaresultpins.com/api/v1${path}`;
  const res = await fetch(target, {
    method: url.searchParams.get("method") ?? "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${key}` },
  });
  const text = await res.text();
  return new Response(JSON.stringify({ target, status: res.status, body: text.slice(0, 4000) }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
