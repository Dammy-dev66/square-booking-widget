// /api/availability.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { serviceVariationId, teamMemberId, startDate } = req.body;

    const startTime = startDate || new Date().toISOString();
    const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const response = await fetch("https://connect.squareup.com/v2/bookings/availability/search", {
      method: "POST",
      headers: {
        "Square-Version": "2023-12-13",
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
                team_member_id_filter: teamMemberId ? { all: [teamMemberId] } : undefined
              }
            ],
            start_at_range: {
              start_at: startTime,
              end_at: endTime
            }
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Square API error');
    }

    res.status(200).json({ availability: data.availabilities || [] });
  } catch (err) {
    console.error("Error fetching availability", err);
    
    // Fallback demo availability
    const demoAvailability = [
      { 
        start_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), 
        appointment_segments: [{ duration_minutes: 30, team_member_id: '1' }] 
      },
      { 
        start_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), 
        appointment_segments: [{ duration_minutes: 30, team_member_id: '2' }] 
      },
      { 
        start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), 
        appointment_segments: [{ duration_minutes: 30, team_member_id: '3' }] 
      }
    ];
    
    res.status(200).json({ availability: demoAvailability });
  }
}
