const express = require('express');
const axios = require('axios');
const router = express.Router();

const SQUARE_BASE_URL =  
    process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com/v2"
    : "https://connect.squareupsandbox.com/v2";
const ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;

const squareHeaders = {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Square-Version': '2023-10-18'
};

// Get all services - with fallback to demo data
router.get('/services', async (req, res) => {
    try {
        console.log('Attempting to fetch services from Square API...');
        console.log('Access Token:', ACCESS_TOKEN ? 'Present' : 'Missing');
        
        const response = await axios.get(`${SQUARE_BASE_URL}/catalog/list`, {
            headers: squareHeaders,
            params: {
                types: 'ITEM'
            }
        });
        
        console.log('Square API response:', response.status);
        
        const services = response.data.objects?.filter(item => 
            item.type === 'ITEM' && item.item_data
        ) || [];
        
        res.json({ services });
    } catch (error) {
        console.error('Square API Error:', error.response?.status, error.response?.data || error.message);
        
        // Return demo data as fallback
        const demoServices = [
            {
                id: '1',
                type: 'ITEM',
                item_data: {
                    name: 'Haircut',
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
        
        console.log('Returning demo data due to API error');
        res.json({ services: demoServices });
    }
});

// Get team members - with fallback
router.get('/team-members', async (req, res) => {
    try {
        console.log('Attempting to fetch team members...');
        
        const response = await axios.get(`${SQUARE_BASE_URL}/team-members`, {
            headers: squareHeaders
        });
        
        const teamMembers = response.data.team_members?.filter(member => 
            member.status === 'ACTIVE'
        ) || [];
        
        res.json({ teamMembers });
    } catch (error) {
        console.error('Team Members API Error:', error.response?.status, error.response?.data || error.message);
        
        // Return demo team members
        const demoTeamMembers = [
            { id: '1', given_name: 'Dave', family_name: 'Smith', status: 'ACTIVE' },
            { id: '2', given_name: 'James', family_name: 'Johnson', status: 'ACTIVE' },
            { id: '3', given_name: 'Mike', family_name: 'Wilson', status: 'ACTIVE' }
        ];
        
        console.log('Returning demo team members');
        res.json({ teamMembers: demoTeamMembers });
    }
});

// Search availability - simplified for demo
router.post('/availability', async (req, res) => {
    try {
        // For now, return demo availability
        const demoAvailability = [
            { start_at: '2024-09-11T09:00:00Z', appointment_segments: [{ duration_minutes: 30 }] },
            { start_at: '2024-09-11T10:30:00Z', appointment_segments: [{ duration_minutes: 30 }] },
            { start_at: '2024-09-11T14:00:00Z', appointment_segments: [{ duration_minutes: 30 }] },
            { start_at: '2024-09-11T15:30:00Z', appointment_segments: [{ duration_minutes: 30 }] }
        ];
        
        res.json({ availability: demoAvailability });
    } catch (error) {
        console.error('Availability Error:', error.message);
        res.status(500).json({ error: 'Failed to search availability' });
    }
});


module.exports = router;
