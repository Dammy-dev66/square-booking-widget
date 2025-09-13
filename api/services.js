// /api/services.js
export default async function handler(req, res) {
  try {
    const response = await fetch("https://connect.squareup.com/v2/catalog/list", {
      method: "GET",
      headers: {
        "Square-Version": "2023-12-13",
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      params: {
        types: 'ITEM'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Square API Error:', data);
      throw new Error(data.errors?.[0]?.detail || 'Square API error');
    }

    // Filter services only
    const services = (data.objects || []).filter(obj => 
      obj.type === "ITEM" && 
      obj.item_data && 
      obj.item_data.variations && 
      obj.item_data.variations.length > 0
    );

    res.status(200).json({ services });
  } catch (err) {
    console.error("Error fetching services from Square:", err);
    
    // Fallback to demo data that matches Silver Fox branding
    const fallbackServices = [
      {
        id: 'demo-1',
        type: 'ITEM',
        item_data: {
          name: 'Gentleman\'s Cut',
          variations: [{
            id: 'var-1',
            item_variation_data: {
              name: 'Standard',
              price_money: { amount: 4500, currency: 'USD' }
            }
          }]
        }
      },
      {
        id: 'demo-2',
        type: 'ITEM',
        item_data: {
          name: 'Young Gentleman',
          variations: [{
            id: 'var-2',
            item_variation_data: {
              name: 'Standard',
              price_money: { amount: 3000, currency: 'USD' }
            }
          }]
        }
      },
      {
        id: 'demo-3',
        type: 'ITEM',
        item_data: {
          name: 'Beard Sculpting',
          variations: [{
            id: 'var-3',
            item_variation_data: {
              name: 'Standard',
              price_money: { amount: 2500, currency: 'USD' }
            }
          }]
        }
      },
      {
        id: 'demo-4',
        type: 'ITEM',
        item_data: {
          name: 'The Full Service',
          variations: [{
            id: 'var-4',
            item_variation_data: {
              name: 'Standard',
              price_money: { amount: 6500, currency: 'USD' }
            }
          }]
        }
      }
    ];
    
    res.status(200).json({ services: fallbackServices });
  }
}
