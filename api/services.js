// /api/services.js
export default async function handler(req, res) {
  try {
    const response = await fetch("https://connect.squareupsandbox.com/v2/catalog/list", {
      method: "GET",
      headers: {
        "Square-Version": "2025-07-17", // use current version
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    // Filter services only
    const services = (data.objects || []).filter(obj => obj.type === "ITEM");

    res.status(200).json({ services });
  } catch (err) {
    console.error("Error fetching services", err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
}
