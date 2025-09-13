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
      console.error('Square Team Members API Error:', data);
      throw new Error(data.errors?.[0]?.detail || 'Square API error');
    }

    const activeMembers = (data.team_members || []).filter(member => 
      member.status === 'ACTIVE' && 
      (member.given_name || member.family_name)
    );

    res.status(200).json({ teamMembers: activeMembers });
  } catch (err) {
    console.error("Error fetching team members from Square:", err);
    
    // Fallback to demo team members matching Silver Fox staff
    const fallbackTeamMembers = [
      { 
        id: 'demo-james', 
        given_name: 'James', 
        family_name: '', 
        status: 'ACTIVE',
        email_address: 'james@silverfoxbarberco.com'
      },
      { 
        id: 'demo-dave', 
        given_name: 'Dave', 
        family_name: '', 
        status: 'ACTIVE',
        email_address: 'dave@silverfoxbarberco.com'
      },
      { 
        id: 'demo-ray', 
        given_name: 'Ray', 
        family_name: '', 
        status: 'ACTIVE',
        email_address: 'ray@silverfoxbarberco.com'
      }
    ];
    
    res.status(200).json({ teamMembers: fallbackTeamMembers });
  }
}
