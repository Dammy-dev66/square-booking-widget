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
    const { serviceVariationId } = req.body;

    if (!serviceVariationId) {
      return res.status(400).json({ error: "Service variation ID required" });
    }

    const { result } = await client.bookingsApi.searchAvailability({
      query: {
        filter: {
          serviceVariationId,
          locationId: process.env.SQUARE_LOCATION_ID,
        },
      },
    });

    const availability = result.availabilities || [];
    return res.status(200).json({ availability });
  } catch (error) {
    console.error("Availability API error:", error);
    return res.status(500).json({ error: "Failed to load availability" });
  }
}
