class BookingWidget {
    constructor() {
        this.selectedService = null;
        this.selectedBarber = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.services = [];
        this.barbers = [];
        this.availability = [];
        this.currentStep = 1;
        this.init();
    }

    async init() {
        try {
            await this.loadServices();
            this.renderServices();
            this.updateProgress();
        } catch (error) {
            console.error('Init error:', error);
            this.showError();
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const width = (this.currentStep / 3) * 100;
        progressFill.style.width = width + '%';
    }

    async loadServices() {
        try {
            const response = await fetch('/api/services');
            const data = await response.json();
            this.services = data.services;
        } catch (error) {
            console.error('Failed to load services:', error);
            this.services = [];
        }
    }

    async loadBarbers() {
        try {
            const response = await fetch('/api/team-members');
            const data = await response.json();
            this.barbers = data.teamMembers;
        } catch (error) {
            console.error('Failed to load barbers:', error);
            this.barbers = [];
        }
    }

    async loadAvailability(serviceVariationId = null) {
        try {
            const response = await fetch('/api/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceVariationId: serviceVariationId || this.selectedService?.id
                })
            });
            const data = await response.json();
            this.availability = data.availability;
        } catch (error) {
            console.error('Failed to load availability:', error);
            this.availability = [];
        }
    }

    renderServices() {
        const grid = document.getElementById('services-grid');
        grid.innerHTML = '';

        const servicesToRender = this.services && this.services.length > 0 
            ? this.processApiServices() 
            : this.getDemoServices();

        servicesToRender.forEach(service => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-icon">${service.icon}</div>
                <h3>${service.name}</h3>
                <div class="card-price">From $${service.basePrice}</div>
                <div class="card-duration">${service.duration} min</div>
                <div class="card-description">${service.description}</div>
            `;
            card.addEventListener('click', () => this.selectService(service, card));
            grid.appendChild(card);
        });
    }

    processApiServices() {
        return this.services.map((service, index) => {
            const price = service.item_data?.variations?.[0]?.item_variation_data?.price_money?.amount / 100 || 25;
            const icons = ['✂️', '👶', '🧔', '💫', '🪒', '⭐'];
            const descriptions = [
                'Classic precision cutting with modern techniques',
                'Gentle styling perfect for young gentlemen',
                'Expert beard shaping and grooming',
                'Complete grooming experience',
                'Traditional hot towel shave experience',
                'Premium styling with consultation'
            ];
            
            return {
                id: service.id,
                variationId: service.item_data?.variations?.[0]?.id,
                name: service.item_data?.name || 'Service',
                basePrice: price,
                duration: 30,
                icon: icons[index % icons.length],
                description: descriptions[index % descriptions.length]
            };
        });
    }

    getDemoServices() {
        return [
            { 
                id: '1', 
                variationId: '1',
                name: 'Signature Haircut', 
                basePrice: 25, 
                duration: 30,
                icon: '✂️',
                description: 'Classic precision cutting with modern techniques'
            },
            { 
                id: '2', 
                variationId: '2',
                name: 'Kids Cut', 
                basePrice: 20, 
                duration: 25,
                icon: '👶',
                description: 'Gentle styling perfect for young gentlemen'
            },
            { 
                id: '3', 
                variationId: '3',
                name: 'Beard Trim', 
                basePrice: 15, 
                duration: 20,
                icon: '🧔',
                description: 'Expert beard shaping and grooming'
            },
            { 
                id: '4', 
                variationId: '4',
                name: 'Haircut + Beard', 
                basePrice: 35, 
                duration: 45,
                icon: '💫',
                description: 'Complete grooming experience'
            }
        ];
    }

    async selectService(service, cardElement) {
        document.querySelectorAll('#services-grid .card').forEach(card => {
            card.classList.remove('selected');
        });
        
        cardElement.classList.add('selected');
        this.selectedService = service;
        this.showLoading();
        
        setTimeout(async () => {
            try {
                await this.loadBarbers();
                await this.loadAvailability(service.variationId);
                this.currentStep = 2;
                this.updateProgress();
                this.showStep('step-barbers');
                this.renderServiceInfo();
                this.renderBarbersWithAvailability();
            } catch (error) {
                this.showError();
            }
        }, 600);
    }

    renderServiceInfo() {
        const infoDiv = document.getElementById('selected-service-info');
        infoDiv.innerHTML = `
            <h4>Selected Service</h4>
            <p><strong>${this.selectedService.name}</strong> - $${this.selectedService.basePrice} (${this.selectedService.duration} min)</p>
            <p>${this.selectedService.description}</p>
        `;
    }

    renderBarbersWithAvailability() {
        const grid = document.getElementById('barbers-grid');
        grid.innerHTML = '';

        if (this.barbers && this.barbers.length > 0) {
            this.barbers.forEach(barber => {
                const barberAvailability = this.getBarberAvailability(barber.id);
                const card = this.createBarberCard(barber, barberAvailability);
                grid.appendChild(card);
            });
        } else {
            this.renderDemoBarbers();
        }
    }

    getBarberAvailability(barberId) {
        return this.availability
            .filter(slot => 
                slot.appointment_segments?.some(segment => 
                    segment.team_member_id === barberId
                )
            )
            .slice(0, 3)
            .map(slot => {
                const date = new Date(slot.start_at);
                const isToday = date.toDateString() === new Date().toDateString();
                const isTomorrow = date.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
                
                let dayLabel = '';
                if (isToday) dayLabel = 'Today';
                else if (isTomorrow) dayLabel = 'Tomorrow';
                else dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                
                const timeLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                
                return {
                    datetime: slot.start_at,
                    display: `${dayLabel} ${timeLabel}`
                };
            });
    }

    createBarberCard(barber, availability) {
        const card = document.createElement('div');
        card.className = 'card barber-availability-card';
        
        const memberName = `${barber.given_name || ''} ${barber.family_name || ''}`.trim() || 'Team Member';
        const nextSlots = availability.length > 0 ? availability : [{ display: 'No availability found', datetime: null }];
        
        card.innerHTML = `
            <div class="barber-avatar">${memberName.charAt(0)}</div>
            <h3>${memberName}</h3>
            <div class="card-price">$${this.selectedService.basePrice}</div>
            <div class="available-times">
                <strong>Next Available:</strong>
                ${nextSlots.map(slot => `<div class="time-slot ${!slot.datetime ? 'unavailable' : ''}">${slot.display}</div>`).join('')}
            </div>
            ${nextSlots[0].datetime 
                ? `<button class="book-btn" onclick="bookingWidget.selectBarberAndTime('${barber.id}', '${memberName}', '${nextSlots[0].datetime}', '${nextSlots[0].display}')">Book ${nextSlots[0].display}</button>`
                : '<button class="book-btn" disabled>No slots available</button>'
            }
        `;
        
        return card;
    }

    renderDemoBarbers() {
        const grid = document.getElementById('barbers-grid');
        
        const demoBarbers = [
            { 
                id: '1', 
                name: 'Master Dave', 
                price: this.selectedService.basePrice + 5, 
                availableSlots: ['Today 2:00 PM', 'Today 4:30 PM', 'Tomorrow 9:00 AM'],
                specialty: 'Classic & Modern Cuts',
                rating: '★★★★★',
                experience: '15+ years'
            },
            { 
                id: '2', 
                name: 'James "The Artist"', 
                price: this.selectedService.basePrice + 10, 
                availableSlots: ['Today 3:30 PM', 'Tomorrow 11:00 AM', 'Tomorrow 2:00 PM'],
                specialty: 'Creative Styling',
                rating: '★★★★★',
                experience: '12+ years'
            },
            { 
                id: '3', 
                name: 'Mike Sterling', 
                price: this.selectedService.basePrice, 
                availableSlots: ['Tomorrow 11:00 AM', 'Tomorrow 1:30 PM', 'Wed 10:00 AM'],
                specialty: 'Traditional Barbering',
                rating: '★★★★☆',
                experience: '8+ years'
            }
        ];

        demoBarbers.forEach(barber => {
            const card = document.createElement('div');
            card.className = 'card barber-availability-card';
            card.innerHTML = `
                <div class="barber-avatar">${barber.name.charAt(0)}</div>
                <h3>${barber.name}</h3>
                <div class="card-price">$${barber.price}</div>
                <div class="barber-rating">${barber.rating}</div>
                <div class="specialty">${barber.specialty}</div>
                <div class="available-times">
                    <strong>Next Available:</strong>
                    ${barber.availableSlots.map(slot => `<div class="time-slot">${slot}</div>`).join('')}
                </div>
                <button class="book-btn" onclick="bookingWidget.selectBarberAndTime('${barber.id}', '${barber.name}', null, '${barber.availableSlots[0]}')">
                    Book ${barber.availableSlots[0]}
                </button>
            `;
            grid.appendChild(card);
        });
    }

    selectBarberAndTime(barberId, barberName, datetime, displayTime) {
        this.selectedBarber = {
            id: barberId,
            name: barberName,
            price: this.selectedService.basePrice
        };
        this.selectedTime = displayTime;
        this.selectedDate = datetime ? new Date(datetime) : new Date();

        const dateStr = this.selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        this.showSuccessModal(displayTime, dateStr);
    }

    showSuccessModal(time, dateStr) {
        const modal = document.getElementById('success-modal');
        const summary = document.getElementById('booking-summary');
        
        summary.innerHTML = `
            <div style="text-align: left; margin: 1.5rem 0;">
                <p><strong>Service:</strong> ${this.selectedService.name}</p>
                <p><strong>Barber:</strong> ${this.selectedBarber.name}</p>
                <p><strong>Date:</strong> ${dateStr}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Duration:</strong> ${this.selectedService.duration} minutes</p>
                <p><strong>Total:</strong> $${this.selectedBarber.price}</p>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }

    showStep(stepId) {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.add('hidden');
            step.classList.remove('active');
        });
        document.getElementById(stepId).classList.remove('hidden');
        document.getElementById(stepId).classList.add('active');
        this.hideLoading();
        this.hideError();
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError() {
        document.getElementById('error').classList.remove('hidden');
        this.hideLoading();
    }

    hideError() {
        document.getElementById('error').classList.add('hidden');
    }
}

// Navigation functions
function goBack() {
    bookingWidget.currentStep = 1;
    bookingWidget.updateProgress();
    bookingWidget.showStep('step-services');
}

function goBackToBarbers() {
    bookingWidget.currentStep = 2;
    bookingWidget.updateProgress();
    bookingWidget.showStep('step-barbers');
}

async function goToCheckout() {
    document.getElementById('success-modal').classList.add('hidden');
    
    try {
        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                serviceName: bookingWidget.selectedService.name,
                barberName: bookingWidget.selectedBarber.name,
                price: bookingWidget.selectedBarber.price,
                duration: bookingWidget.selectedService.duration
            }),
        });

        const data = await res.json();
        if (data.url) {
            window.location.href = data.url; // Redirect to Square checkout
        } else {
            alert("Error creating checkout link: " + (data.error || "Unknown error"));
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert("Failed to process checkout");
    }
}

// Initialize the booking widget
const bookingWidget = new BookingWidget();

// Set up fallback link
document.addEventListener('DOMContentLoaded', function() {
    const fallbackLink = document.getElementById('fallback-link');
    if (fallbackLink) {
        fallbackLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'https://square.site/book/your-fallback-url';
        });
    }
});
