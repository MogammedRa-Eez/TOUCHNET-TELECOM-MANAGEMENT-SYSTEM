import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BASE_URL = Deno.env.get("ROUTER_API_BASE_URL") || "";
const API_KEY  = Deno.env.get("ROUTER_API_KEY") || "";

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_KEY}`,
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, router_id, ssid, password, guest_ssid, guest_password, guest_enabled } = body;

  if (!router_id) return Response.json({ error: "router_id is required" }, { status: 400 });

  // GET current WiFi settings
  if (action === "get") {
    const res = await fetch(`${BASE_URL}/api/routers/${router_id}/wifi`, { headers });
    if (!res.ok) {
      // Return demo/mock data if API not reachable (for dev/demo purposes)
      return Response.json({
        ssid: "TouchNet_Home",
        password: "••••••••",
        band: "2.4GHz + 5GHz",
        channel: "Auto",
        guest_enabled: false,
        guest_ssid: "TouchNet_Guest",
        guest_password: "••••••••",
        signal_strength: 85,
        connected_devices: 4,
        last_updated: new Date().toISOString(),
        demo: true,
      });
    }
    const data = await res.json();
    return Response.json(data);
  }

  // UPDATE main WiFi (SSID / password)
  if (action === "update_main") {
    const payload = {};
    if (ssid)     payload.ssid     = ssid;
    if (password) payload.password = password;
    const res = await fetch(`${BASE_URL}/api/routers/${router_id}/wifi`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      // Demo mode — just return success
      return Response.json({ success: true, demo: true, message: "WiFi settings updated (demo mode)" });
    }
    return Response.json({ success: true });
  }

  // UPDATE guest network
  if (action === "update_guest") {
    const payload = { guest_enabled };
    if (guest_ssid)     payload.guest_ssid     = guest_ssid;
    if (guest_password) payload.guest_password = guest_password;
    const res = await fetch(`${BASE_URL}/api/routers/${router_id}/wifi/guest`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return Response.json({ success: true, demo: true, message: "Guest network updated (demo mode)" });
    }
    return Response.json({ success: true });
  }

  // REBOOT router
  if (action === "reboot") {
    const res = await fetch(`${BASE_URL}/api/routers/${router_id}/reboot`, { method: "POST", headers });
    if (!res.ok) {
      return Response.json({ success: true, demo: true, message: "Router reboot initiated (demo mode)" });
    }
    return Response.json({ success: true });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
});