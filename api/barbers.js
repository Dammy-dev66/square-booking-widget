// /api/barbers.js
export default async function handler(req, res) {
  try {
    const response = await fetch("https://connect.squareupsandbox.com/v2/team-members/search", {
      method: "POST",
      headers: {
        "Square-Version": "2025-07-17",
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: { filter: { status: "ACTIVE" } }
      })
    });

    const data = await response.json();
    res.status(200).json({ barbers: data.team_members || [] });
  } catch (err) {
    console.error("Error fetching barbers", err);
    res.status(500).json({ error: "Failed to fetch barbers" });
  }
}
