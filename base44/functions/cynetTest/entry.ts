import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BASE_URL  = Deno.env.get("CYNET_BASE_URL")  || "";
const USERNAME  = Deno.env.get("CYNET_USERNAME")  || "";
const PASSWORD  = Deno.env.get("CYNET_PASSWORD")  || "";
const CLIENT_ID = Deno.env.get("CYNET_CLIENT_ID") || "";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Try GET method first (per docs)
    const getRes = await fetch(`${BASE_URL}/api/account/token`, {
      method: "GET",
      headers: { "username": USERNAME, "password": PASSWORD, "Content-Type": "application/json" },
    });
    const getBody = await getRes.text();

    // Also try POST method
    const postRes = await fetch(`${BASE_URL}/api/account/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: USERNAME, password: PASSWORD }),
    });
    const postBody = await postRes.text();

    return Response.json({
      base_url: BASE_URL,
      username_set: !!USERNAME,
      password_set: !!PASSWORD,
      client_id_set: !!CLIENT_ID,
      get_status: getRes.status,
      get_body_preview: getBody.substring(0, 300),
      post_status: postRes.status,
      post_body_preview: postBody.substring(0, 300),
    });
  } catch (error) {
    return Response.json({ error: error.message });
  }
});