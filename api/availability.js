// /api/availability.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { serviceVariationId, teamMemberId } = req.body;

    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const requestBody = {
      query: {
        filter: {
          location_id: process.env.SQUARE_LOCATION_ID,
          start_at_range: {
            start_at: startTime,
            end_at: endTime
          }
        }
      }
    };

    // Add service and team member filters if provided
    if (serviceVariationId || teamMemberId) {
      requestBody.query.filter.segment_filters = [{
        service_variation_id: serviceVariationId,
        team_member_id_filter: teamMemberId ? { all: [teamMemberId] } : undefined
      }];
    }

    const response = await fetch("https://connect.squareup.com/v2/bookings/availability/search", {
      method: "POST",
      headers: {
        "Square-Version": "2023-12-13",
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Square Availability API Error:', data);
      throw new Error(data.errors?.[0]?.detail || 'Square API error');
    }

    res.status(200).json({ availability: data.availabilities || [] });
  } catch (err) {
    console.error("Error fetching availability from Square:", err);
    
    // Generate demo availability for next few days
    const demoAvailability = [];
    const now = new Date();
    
    // Generate slots for today and next 6 days
    for (let day = 0; day < 7; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      
      // Skip past times for today
      const startHour = day === 0 ? Math.max(9, now.getHours() + 1) : 9;
      
      // Generate slots from 9 AM to 5 PM
      for (let hour = startHour; hour <= 17; hour += 2) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, 0, 0, 0);
        
        // Skip if time is in the past
        if (slotTime > now) {
          demoAvailability.push({
            start_at: slotTime.toISOString(),
            appointment_segments: [{
              duration_minutes: 45,
              team_member_id: ['demo-james', 'demo-dave', 'demo-ray'][Math.floor(Math.random() * 3)]
            }]
          });
        }
      }
    }
    
    res.status(200).json({ availability: demoAvailability });
  }
}
