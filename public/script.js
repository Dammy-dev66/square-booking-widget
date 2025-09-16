// script.js

let selectedService = null;
let selectedBarber = null;
let bookingDetails = {};

// Progress Bar Function
function updateProgress(step) {
    const fill = document.getElementById('progress-fill');
    const steps = document.querySelectorAll('.progress-step');
    
    steps.forEach((s, index) => {
        if (index < step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
    
    fill.style.width = ((step - 1) / (steps.length - 1)) * 100 + '%';
}

// Loading + Error Handling
function showLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
}

function showError(show) {
    document.getElementById('error').classList.toggle('hidden', !show);
}

// Step Navigation
function goBack() {
    document.getElementById('step-barbers').classList.add('hidden');
    document.getElementById('step-services').classList.remove('hidden');
    updateProgress(1);
}

// ✅ Fetch Services
async function fetchServices() {
    try {
        showLoading(true);
        const response = await fetch('/api/services');
        if (!response.ok) throw new Error('Network error');
        const services = await response.json();
        renderServices(services);
    } catch (error) {
        console.error(error);
        showError(true);
    } finally {
        showLoading(false);
    }
}

// ✅ Fetch Barbers
async function fetchBarbers(serviceId) {
    try {
        showLoading(true);
        const response = await fetch('/api/team-members');
        if (!response.ok) throw new Error('Network error');
        const barbers = await response.json();
        renderBarbers(barbers, serviceId);
    } catch (error) {
        console.error(error);
        showError(true);
    } finally {
        showLoading(false);
    }
}

// Render Services
function renderServices(services) {
    const grid = document.getElementById('services-grid');
    grid.innerHTML = '';
    
    services.forEach(service => {
        const div = document.createElement('div');
        div.className = 'service-card';
        div.innerHTML = `
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <span class="price">$${(service.price / 100).toFixed(2)}</span>
        `;
        div.onclick = () => selectService(service);
        grid.appendChild(div);
    });
}

// Select Service
function selectService(service) {
    selectedService = service;
    bookingDetails.service = service;
    
    document.getElementById('step-services').classList.add('hidden');
    document.getElementById('step-barbers').classList.remove('hidden');
    
    document.getElementById('selected-service-info').innerHTML = `
        <h3>Selected Service</h3>
        <p>${service.name} - $${(service.price / 100).toFixed(2)}</p>
    `;
    
    updateProgress(2);
    fetchBarbers(service.id);
}

// Render Barbers
function renderBarbers(barbers, serviceId) {
    const grid = document.getElementById('barbers-grid');
    grid.innerHTML = '';
    
    barbers.forEach(barber => {
        const div = document.createElement('div');
        div.className = 'barber-card';
        div.innerHTML = `
            <img src="${barber.image || 'default-barber.jpg'}" alt="${barber.name}">
            <h3>${barber.name}</h3>
            <p>${barber.experience} years experience</p>
        `;
        div.onclick = () => selectBarber(barber);
        grid.appendChild(div);
    });
}

// Select Barber
function selectBarber(barber) {
    selectedBarber = barber;
    bookingDetails.barber = barber;

    document.getElementById('success-modal').classList.remove('hidden');
    
    document.getElementById('booking-summary').innerHTML = `
        <p><strong>Service:</strong> ${selectedService.name}</p>
        <p><strong>Price:</strong> $${(selectedService.price / 100).toFixed(2)}</p>
        <p><strong>Barber:</strong> ${barber.name}</p>
    `;
    
    updateProgress(3);
}

// ✅ Checkout Request
async function goToCheckout() {
    try {
        showLoading(true);
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingDetails)
        });
        
        if (!response.ok) throw new Error('Checkout failed');
        
        const { checkoutUrl } = await response.json();
        window.location.href = checkoutUrl;
    } catch (error) {
        console.error(error);
        alert('Checkout failed, please try again.');
    } finally {
        showLoading(false);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchServices();
});
