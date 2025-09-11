// /api/availability.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { serviceVariationId, barberId, startAt } = req.body;

    const response = await fetch("https://connect.squareupsandbox.com/v2/bookings/availability/search", {
      method: "POST",
      headers: {
        "Square-Version": "2025-07-17",
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: {
          filter: {
            location_id: process.env.SQUARE_LOCATION_ID,
            segment_filters: [
              {
                service_variation_id: serviceVariationId,
                team_member_id_filter: { all: [barberId] }
              }
            ]
          }
        },
        start_at: startAt || new Date().toISOString(),
        max_results: 3
      })
    });

    const data = await response.json();
    res.status(200).json({ availability: data.availabilities || [] });
  } catch (err) {
    console.error("Error fetching availability", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
}
