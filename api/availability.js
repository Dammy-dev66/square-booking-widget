// api/availability.js
import { Client, Environment } from "square";

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
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
      return res.status(400).json({ error: "Missing required field: serviceVariationId" });
    }

    if (!process.env.SQUARE_LOCATION_ID) {
      console.error("Missing SQUARE_LOCATION_ID");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    // Build the body for the Bookings API searchAvailability call
    const body = {
      query: {
        filter: {
          serviceVariationId,
          locationId: process.env.SQUARE_LOCATION_ID,
        }
      }
    };

    // optional: add a range if provided (ISO timestamps expected)
    if (startAt || endAt) {
      body.query.range = {};
      if (startAt) body.query.range.startAt = startAt;
      if (endAt) body.query.range.endAt = endAt;
    }

    const resp = await client.bookingsApi.searchAvailability(body);
    const availability = resp?.result?.availabilities || [];

    return res.status(200).json({ availability });
  } catch (error) {
    console.error("Availability API error:", error);
    // Keep response structure predictable for the frontend
    return res.status(500).json({ error: "Failed to load availability" });
  }
}
