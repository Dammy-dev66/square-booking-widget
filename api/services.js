// /api/services.js
export default async function handler(req, res) {
  try {
    const response = await fetch("https://connect.squareup.com/v2/catalog/list", {
      method: "GET",
      headers: {
        "Square-Version": "2023-12-13",
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Square API error');
    }

    // Filter services only
    const services = (data.objects || []).filter(obj => obj.type === "ITEM");

    res.status(200).json({ services });
  } catch (err) {
    console.error("Error fetching services", err);
    
    // Fallback demo data
    const demoServices = [
      {
        id: '1',
        type: 'ITEM',
        item_data: {
          name: 'Signature Haircut',
          variations: [{
            id: '1',
            item_variation_data: {
              name: 'Regular',
              price_money: { amount: 2500, currency: 'USD' }
            }
          }]
        }
      },
      {
        id: '2',
        type: 'ITEM',
        item_data: {
          name: 'Kids Cut',
          variations: [{
            id: '2',
            item_variation_data: {
              name: 'Regular',
              price_money: { amount: 2000, currency: 'USD' }
            }
          }]
        }
      },
      {
        id: '3',
        type: 'ITEM',
        item_data: {
          name: 'Beard Trim',
          variations: [{
            id: '3',
            item_variation_data: {
              name: 'Regular',
              price_money: { amount: 1500, currency: 'USD' }
            }
          }]
        }
      }
    ];
    
    res.status(200).json({ services: demoServices });
  }
}
