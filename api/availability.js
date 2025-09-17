// api/availability.js
import { Client, Environment } from "square";

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT?.toLowerCase() === "production"
      ? Environment.Production
      : Environment.Sandbox,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { serviceVariationId, startAt, endAt } = req.body || {};

    if (!serviceVariationId) {
      return res
        .status(400)
        .json({ error: "Missing required field: serviceVariationId" });
    }

    if (!process.env.SQUARE_LOCATION_ID) {
      console.error("Missing SQUARE_LOCATION_ID");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    // Build request body for Availability API
    const body = {
      query: {
        filter: {
          service_variation_id: serviceVariationId,
          location_id: process.env.SQUARE_LOCATION_ID,
        },
      },
    };

    if (startAt || endAt) {
      body.query.filter.start_at = startAt;
      body.query.filter.end_at = endAt;
    }

    const resp = await client.availabilityApi.searchAvailability(body);

    if (resp?.errors) {
      console.error("Square API returned errors:", resp.errors);
      return res.status(500).json({ error: "Square API error", details: resp.errors });
    }

    const availability = resp?.result?.availabilities || [];
    return res.status(200).json({ availability });
  } catch (error) {
    console.error("Availability API error:", error?.errors || error?.response || error);
    return res.status(500).json({ error: "Failed to load availability" });
  }
}
