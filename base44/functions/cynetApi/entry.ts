import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BASE_URL = Deno.env.get("CYNET_BASE_URL") || "";
const USERNAME = Deno.env.get("CYNET_USERNAME") || "";
const PASSWORD = Deno.env.get("CYNET_PASSWORD") || "";

async function getAuthToken() {
  const res = await fetch(`${BASE_URL}/api/account/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName: USERNAME, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Cynet auth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token || data.token || data.Token;
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

    const token = await getAuthToken();

    switch (action) {
      case "get_alerts": {
        // Fetch recent alerts/threats
        const data = await cynetGet("/api/alerts?pageSize=100&pageIndex=0", token);
        return Response.json({ success: true, data });
      }

      case "get_endpoints": {
        // Fetch endpoint/device list
        const data = await cynetGet("/api/hosts?pageSize=100&pageIndex=0", token);
        return Response.json({ success: true, data });
      }

      case "get_alert_details": {
        const { alertId } = payload || {};
        if (!alertId) return Response.json({ error: "alertId required" }, { status: 400 });
        const data = await cynetGet(`/api/alerts/${alertId}`, token);
        return Response.json({ success: true, data });
      }

      case "remediate_isolate": {
        // Isolate a host
        const { hostId } = payload || {};
        if (!hostId) return Response.json({ error: "hostId required" }, { status: 400 });
        const data = await cynetPost(`/api/remediation/isolate`, { hostId }, token);
        return Response.json({ success: true, data });
      }

      case "remediate_unisolate": {
        // Unisolate a host
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

      case "get_dashboard_stats": {
        // Fetch summary stats for dashboard cards
        const [alerts, endpoints] = await Promise.all([
          cynetGet("/api/alerts?pageSize=100&pageIndex=0", token),
          cynetGet("/api/hosts?pageSize=100&pageIndex=0", token),
        ]);
        return Response.json({ success: true, alerts, endpoints });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});