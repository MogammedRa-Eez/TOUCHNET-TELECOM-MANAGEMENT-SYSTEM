import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY") || "";
  return Response.json({ apiKey });
});