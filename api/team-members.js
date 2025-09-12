// /api/team-members.js
export default async function handler(req, res) {
  try {
    const response = await fetch("https://connect.squareup.com/v2/team-members/search", {
      method: "POST",
      headers: {
        "Square-Version": "2023-12-13",
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: { 
          filter: { 
            status: "ACTIVE",
            location_ids: [process.env.SQUARE_LOCATION_ID]
          } 
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Square API error');
    }

    res.status(200).json({ teamMembers: data.team_members || [] });
  } catch (err) {
    console.error("Error fetching team members", err);
    
    // Fallback demo data
    const demoTeamMembers = [
      { id: '1', given_name: 'Dave', family_name: 'Smith', status: 'ACTIVE' },
      { id: '2', given_name: 'James', family_name: 'Johnson', status: 'ACTIVE' },
      { id: '3', given_name: 'Mike', family_name: 'Wilson', status: 'ACTIVE' }
    ];
    
    res.status(200).json({ teamMembers: demoTeamMembers });
  }
}
