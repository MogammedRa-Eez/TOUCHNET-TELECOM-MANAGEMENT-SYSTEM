import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Triggered by entity automation when a FibreProject status changes to 'live' or 'billed'.
 * Geocodes the site_address and stores lat/lng on the project for the coverage map.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const projectId = body?.event?.entity_id;
    const projectData = body?.data;

    if (!projectId) {
      return Response.json({ error: 'No entity_id in payload' }, { status: 400 });
    }

    const address = projectData?.site_address;
    if (!address) {
      return Response.json({ skipped: true, reason: 'No site_address on project' });
    }

    // Geocode via Nominatim (free, no key required)
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const geoRes = await fetch(geoUrl, {
      headers: { 'User-Agent': 'TouchNet-CoverageSync/1.0' }
    });
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      console.warn(`Could not geocode address: ${address}`);
      return Response.json({ skipped: true, reason: 'Geocoding returned no results', address });
    }

    const lat = parseFloat(geoData[0].lat);
    const lng = parseFloat(geoData[0].lon);

    // Update the project with coverage coordinates
    await base44.asServiceRole.entities.FibreProject.update(projectId, {
      coverage_lat: lat,
      coverage_lng: lng,
      coverage_synced: true,
    });

    console.log(`Coverage synced for project ${projectId}: [${lat}, ${lng}]`);
    return Response.json({ success: true, projectId, lat, lng });

  } catch (error) {
    console.error('Coverage sync error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});