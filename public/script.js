class BookingWidget {
    constructor() {
        this.selectedService = null;
        this.selectedBarber = null;
        this.selectedDate = null;
        this.services = [];
        this.barbers = [];
        this.currentStep = 1;
        this.init();
    }

    async init() {
    try {
        // Always render demo services to avoid loading issues
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

    renderServices() {
        const grid = document.getElementById('services-grid');
        grid.innerHTML = '';

        // Use real API data if available, otherwise use enhanced demo data
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
                name: 'Signature Haircut', 
                basePrice: 25, 
                duration: 30,
                icon: '✂️',
                description: 'Classic precision cutting with modern techniques'
            },
            { 
                id: '2', 
                name: 'Kids Cut', 
                basePrice: 20, 
                duration: 25,
                icon: '👶',
                description: 'Gentle styling perfect for young gentlemen'
            },
            { 
                id: '3', 
                name: 'Beard Trim', 
                basePrice: 15, 
                duration: 20,
                icon: '🧔',
                description: 'Expert beard shaping and grooming'
            },
            { 
                id: '4', 
                name: 'Haircut + Beard', 
                basePrice: 35, 
                duration: 45,
                icon: '💫',
                description: 'Complete grooming experience'
            }
        ];
    }

    async selectService(service, cardElement) {
        // Remove selected class from all cards
        document.querySelectorAll('#services-grid .card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selected class to clicked card
        cardElement.classList.add('selected');
        
        this.selectedService = service;
        this.showLoading();
        
        // Small delay for visual feedback
        setTimeout(async () => {
            try {
                await this.loadBarbers();
                this.currentStep = 2;
                this.updateProgress();
                this.showStep('step-barbers');
                this.renderServiceInfo();
                this.renderBarbers();
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

    renderBarbers() {
        const grid = document.getElementById('barbers-grid');
        grid.innerHTML = '';

        // Enhanced demo barbers
        const demoBarbers = [
            { 
                id: '1', 
                name: 'Master Dave', 
                price: this.selectedService.basePrice + 5, 
                nextAvailable: '2:00 PM Today',
                specialty: 'Classic & Modern Cuts',
                rating: '★★★★★',
                experience: '15+ years'
            },
            { 
                id: '2', 
                name: 'James "The Artist"', 
                price: this.selectedService.basePrice + 10, 
                nextAvailable: '3:30 PM Today',
                specialty: 'Creative Styling',
                rating: '★★★★★',
                experience: '12+ years'
            },
            { 
                id: '3', 
                name: 'Mike Sterling', 
                price: this.selectedService.basePrice, 
                nextAvailable: '11:00 AM Tomorrow',
                specialty: 'Traditional Barbering',
                rating: '★★★★☆',
                experience: '8+ years'
            }
        ];

        demoBarbers.forEach(barber => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="barber-avatar">${barber.name.charAt(0)}</div>
                <h3>${barber.name}</h3>
                <div class="card-price">$${barber.price}</div>
                <div class="barber-rating">${barber.rating}</div>
                <div class="card-duration">Next: ${barber.nextAvailable}</div>
                <div class="card-description">
                    <strong>${barber.specialty}</strong><br>
                    ${barber.experience} experience
                </div>
            `;
            card.addEventListener('click', () => this.selectBarber(barber, card));
            grid.appendChild(card);
        });
    }

    async selectBarber(barber, cardElement) {
        // Remove selected class from all cards
        document.querySelectorAll('#barbers-grid .card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selected class to clicked card
        cardElement.classList.add('selected');
        
        this.selectedBarber = barber;
        this.showLoading();
        
        // Small delay for visual feedback
        setTimeout(() => {
            this.currentStep = 3;
            this.updateProgress();
            this.showStep('step-times');
            this.renderBarberInfo();
            this.renderDateSelector();
            this.renderTimes();
        }, 600);
    }

    renderBarberInfo() {
        const infoDiv = document.getElementById('selected-barber-info');
        infoDiv.innerHTML = `
            <h4>Selected Barber</h4>
            <p><strong>${this.selectedBarber.name}</strong> - $${this.selectedBarber.price}</p>
            <p>${this.selectedBarber.specialty} • ${this.selectedBarber.experience} experience</p>
        `;
    }

    renderDateSelector() {
        const dateGrid = document.getElementById('date-options');
        dateGrid.innerHTML = '';

        // Generate next 7 days
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push(date);
        }

        dates.forEach((date, index) => {
            const dateBtn = document.createElement('div');
            dateBtn.className = 'date-btn';
            if (index === 0) {
                dateBtn.classList.add('active');
                this.selectedDate = date;
            }
            
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateNum = date.getDate();
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            
            dateBtn.innerHTML = `
                <div class="day">${dayName}</div>
                <div class="date">${monthName} ${dateNum}</div>
            `;
            
            dateBtn.addEventListener('click', () => {
                document.querySelectorAll('.date-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                dateBtn.classList.add('active');
                this.selectedDate = date;
                this.renderTimes();
            });
            
            dateGrid.appendChild(dateBtn);
        });
    }

    renderTimes() {
        const grid = document.getElementById('times-grid');
        grid.innerHTML = '';

        const availableTimes = [
            '9:00 AM', '10:30 AM', '12:00 PM', 
            '2:00 PM', '3:30 PM', '5:00 PM'
        ];

        availableTimes.forEach(time => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${time}</h3>
                <div class="card-description">Available slot</div>
                <button class="book-btn" onclick="bookingWidget.bookAppointment('${time}')">
                    Book This Time
                </button>
            `;
            grid.appendChild(card);
        });
    }

    bookAppointment(time) {
        const dateStr = this.selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Show success modal instead of alert
        this.showSuccessModal(time, dateStr);
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


