import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BASE_URL = Deno.env.get("CYNET_BASE_URL") || "";
const USERNAME = Deno.env.get("CYNET_USERNAME") || "";
const PASSWORD = Deno.env.get("CYNET_PASSWORD") || "";

// Cynet API uses user_name (underscore) per official docs
// BASE_URL should be: https://YOUR_DOMAIN.api.cynet.com
async function getAuthToken() {
  const endpoints = [
    { url: `${BASE_URL}/api/account/token`,    body: { user_name: USERNAME, password: PASSWORD } },
    { url: `${BASE_URL}/api/v1/account/token`, body: { user_name: USERNAME, password: PASSWORD } },
    { url: `${BASE_URL}/api/v2/account/token`, body: { user_name: USERNAME, password: PASSWORD } },
    { url: `${BASE_URL}/api/v3/account/token`, body: { user_name: USERNAME, password: PASSWORD } },
    // Legacy fallbacks
    { url: `${BASE_URL}/api/account/token`,    body: { userName: USERNAME, password: PASSWORD } },
    { url: `${BASE_URL}/api/auth/token`,        body: { username: USERNAME, password: PASSWORD } },
  ];

  let lastError = "";
  for (const ep of endpoints) {
    const res = await fetch(ep.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(ep.body),
    });
    if (res.ok) {
      const data = await res.json();
      const token = data.access_token || data.token || data.Token || data.accessToken;
      if (token) return { token, authUrl: ep.url };
    }
    const errText = await res.text().catch(() => "");
    lastError = `${ep.url} → ${res.status} ${errText.slice(0, 100)}`;
  }
  throw new Error(`All auth endpoints failed. Last: ${lastError}`);
}

async function cynetGet(path, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Cynet GET ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function cynetPost(path, body, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Cynet POST ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { action, payload } = await req.json();

    const { token, authUrl } = await getAuthToken();

    switch (action) {
      case "getAlerts":
      case "get_alerts": {
        const data = await cynetGet("/api/alerts?pageSize=200&pageIndex=0", token);
        return Response.json({ success: true, data, authUrl });
      }

      case "get_endpoints": {
        const data = await cynetGet("/api/hosts?pageSize=200&pageIndex=0", token);
        return Response.json({ success: true, data, authUrl });
      }

      case "get_dashboard_stats": {
        const [alerts, endpoints] = await Promise.all([
          cynetGet("/api/alerts?pageSize=200&pageIndex=0", token),
          cynetGet("/api/hosts?pageSize=200&pageIndex=0", token),
        ]);
        return Response.json({ success: true, alerts, endpoints, authUrl });
      }

      case "remediate_isolate": {
        const { hostId } = payload || {};
        if (!hostId) return Response.json({ error: "hostId required" }, { status: 400 });
        const data = await cynetPost(`/api/remediation/isolate`, { hostId }, token);
        return Response.json({ success: true, data });
      }

      case "remediate_unisolate": {
        const { hostId } = payload || {};
        if (!hostId) return Response.json({ error: "hostId required" }, { status: 400 });
        const data = await cynetPost(`/api/remediation/unisolate`, { hostId }, token);
        return Response.json({ success: true, data });
      }

      case "kill_process": {
        const { hostId, processId } = payload || {};
        if (!hostId || !processId) return Response.json({ error: "hostId and processId required" }, { status: 400 });
        const data = await cynetPost(`/api/remediation/killprocess`, { hostId, processId }, token);
        return Response.json({ success: true, data });
      }

      case "test_auth": {
        return Response.json({ success: true, message: `Auth succeeded via ${authUrl}`, authUrl });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});