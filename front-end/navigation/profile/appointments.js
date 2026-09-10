// ============================================
// APPOINTMENT BOOKING SYSTEM - JAVASCRIPT
// ============================================

// Services Database
const SERVICES = [
    { id: 'hair-styling', name: 'Hair Styling', emoji: '💇', price: '$50' },
    { id: 'hair-treatment', name: 'Hair Treatment', emoji: '💆', price: '$60' },
    { id: 'manicure', name: 'Manicure', emoji: '💅', price: '$35' },
    { id: 'pedicure', name: 'Pedicure', emoji: '👣', price: '$40' },
    { id: 'spa', name: 'Spa', emoji: '🧖', price: '$75' },
    { id: 'facial', name: 'Facial', emoji: '✨', price: '$55' }
];

// Time slots configuration
const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

// Application State
let state = {
    selectedService: null,
    selectedDate: null,
    selectedTime: null,
    appointments: []
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    renderServices();
    setupEventListeners();
    loadAppointmentsFromStorage();
    setMinDate();
    displayAppointments();
});

function initializeApp() {
    state.appointments = JSON.parse(localStorage.getItem('appointments')) || [];
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Date input
    document.getElementById('appointmentDate').addEventListener('change', (e) => {
        state.selectedDate = e.target.value;
        renderTimeSlots();
        updateBookingSummary();
    });

    // Form submission
    document.getElementById('appointmentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleBookingSubmit();
    });

    // Duration change
    document.getElementById('duration').addEventListener('change', updateBookingSummary);

    // Notes change
    document.getElementById('notes').addEventListener('change', updateBookingSummary);
}

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Refresh appointments list if switching to booked tab
    if (tabName === 'booked') {
        displayAppointments();
    }
}

// ============================================
// SERVICE SELECTION
// ============================================

function renderServices() {
    const serviceGrid = document.getElementById('serviceGrid');
    serviceGrid.innerHTML = SERVICES.map(service => `
        <div class="service-card" data-service-id="${service.id}" onclick="selectService('${service.id}', this)">
            <span class="service-emoji">${service.emoji}</span>
            <p class="service-name">${service.name}</p>
            <p class="service-price">${service.price}</p>
        </div>
    `).join('');
}

function selectService(serviceId, element) {
    // Remove previous selection
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked service
    element.classList.add('selected');
    state.selectedService = serviceId;
    updateBookingSummary();
}

// ============================================
// DATE VALIDATION & TIME SLOTS
// ============================================

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').setAttribute('min', today);
}

function renderTimeSlots() {
    const slotsContainer = document.getElementById('timeSlots');
    
    if (!state.selectedDate) {
        slotsContainer.innerHTML = '<p style="grid-column: 1/-1; color: #999;">Please select a date first</p>';
        return;
    }

    const bookedTimes = getBookedTimesForDate(state.selectedDate);

    slotsContainer.innerHTML = TIME_SLOTS.map(time => `
        <button 
            type="button"
            class="time-slot ${bookedTimes.includes(time) ? 'booked' : ''} ${state.selectedTime === time ? 'selected' : ''}"
            data-time="${time}"
            ${bookedTimes.includes(time) ? 'disabled' : ''}
            onclick="selectTime('${time}', this)"
        >
            ${time}
        </button>
    `).join('');
}

function selectTime(time, element) {
    if (element.classList.contains('booked')) return;

    // Remove previous selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    // Add selection to clicked time
    element.classList.add('selected');
    state.selectedTime = time;
    updateBookingSummary();
}

function getBookedTimesForDate(date) {
    return state.appointments
        .filter(apt => apt.date === date && apt.status !== 'cancelled')
        .map(apt => apt.time);
}

// ============================================
// BOOKING SUMMARY
// ============================================

function updateBookingSummary() {
    const summaryContainer = document.getElementById('bookingSummary');
    const selectedService = SERVICES.find(s => s.id === state.selectedService);
    const duration = document.getElementById('duration').value;

    if (!selectedService || !state.selectedDate || !state.selectedTime) {
        summaryContainer.innerHTML = '<p style="color: #999;">Fill in your booking details above</p>';
        return;
    }

    const dateObj = new Date(state.selectedDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    summaryContainer.innerHTML = `
        <h4>Booking Summary</h4>
        <div class="summary-item">
            <span class="summary-label">Service</span>
            <span class="summary-value">${selectedService.emoji} ${selectedService.name}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Date</span>
            <span class="summary-value">${formattedDate}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Time</span>
            <span class="summary-value">${state.selectedTime}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Duration</span>
            <span class="summary-value">${duration} minutes</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Price</span>
            <span class="summary-value">${selectedService.price}</span>
        </div>
    `;
}

// ============================================
// FORM SUBMISSION
// ============================================

function handleBookingSubmit() {
    // Validate all required fields
    if (!state.selectedService || !state.selectedDate || !state.selectedTime) {
        showErrorMessage('Please fill in all required fields');
        return;
    }

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!fullName || !email || !phone) {
        showErrorMessage('Please fill in your contact information');
        return;
    }

    if (!isValidEmail(email)) {
        showErrorMessage('Please enter a valid email address');
        return;
    }

    // Create appointment object
    const appointment = {
        id: generateId(),
        service: state.selectedService,
        date: state.selectedDate,
        time: state.selectedTime,
        duration: document.getElementById('duration').value,
        fullName: fullName,
        email: email,
        phone: phone,
        notes: document.getElementById('notes').value.trim(),
        status: 'upcoming',
        createdAt: new Date().toISOString()
    };

    // Save appointment
    state.appointments.push(appointment);
    saveAppointmentsToStorage();

    // Show success message
    showSuccessMessage(appointment);

    // Reset form
    setTimeout(resetForm, 2000);
}

function showErrorMessage(message) {
    const summaryContainer = document.getElementById('bookingSummary');
    summaryContainer.innerHTML = `<div class="error-message"><p class="error-text">⚠️ ${message}</p></div>`;
    summaryContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showSuccessMessage(appointment) {
    const form = document.getElementById('appointmentForm');
    const successMsg = document.getElementById('successMessage');
    
    form.style.display = 'none';
    
    const service = SERVICES.find(s => s.id === appointment.service);
    const dateObj = new Date(appointment.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    document.getElementById('successText').textContent = 
        `Your ${service.name} appointment is booked for ${formattedDate} at ${appointment.time}. A confirmation has been sent to ${appointment.email}`;
    
    successMsg.style.display = 'block';
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetForm() {
    document.getElementById('appointmentForm').style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
    
    document.getElementById('appointmentForm').reset();
    document.getElementById('timeSlots').innerHTML = '';
    document.querySelectorAll('.service-card').forEach(card => card.classList.remove('selected'));
    
    state.selectedService = null;
    state.selectedDate = null;
    state.selectedTime = null;
    
    updateBookingSummary();
}

// ============================================
// APPOINTMENTS DISPLAY
// ============================================

function displayAppointments() {
    const listContainer = document.getElementById('appointmentsList');
    const noAppointments = document.getElementById('noAppointments');

    if (state.appointments.length === 0) {
        listContainer.innerHTML = '';
        noAppointments.style.display = 'block';
        return;
    }

    noAppointments.style.display = 'none';

    listContainer.innerHTML = state.appointments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(apt => createAppointmentCard(apt))
        .join('');

    // Add event listeners to action buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => editAppointment(e.target.closest('.appointment-card').dataset.aptId));
    });

    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', (e) => cancelAppointment(e.target.closest('.appointment-card').dataset.aptId));
    });
}

function createAppointmentCard(apt) {
    const service = SERVICES.find(s => s.id === apt.service);
    const dateObj = new Date(apt.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });

    return `
        <div class="appointment-card ${apt.status}" data-apt-id="${apt.id}">
            <div class="appointment-header">
                <div>
                    <div class="appointment-service">${service.emoji} ${service.name}</div>
                </div>
                <span class="appointment-status status-${apt.status}">${apt.status}</span>
            </div>

            <div class="appointment-details">
                <div class="detail-item">
                    <span class="detail-label">📅 Date</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">🕐 Time</span>
                    <span class="detail-value">${apt.time}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">⏱️ Duration</span>
                    <span class="detail-value">${apt.duration} minutes</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">💰 Price</span>
                    <span class="detail-value">${service.price}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">👤 Name</span>
                    <span class="detail-value">${apt.fullName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">📧 Email</span>
                    <span class="detail-value">${apt.email}</span>
                </div>
            </div>

            ${apt.notes ? `
                <div class="appointment-notes">
                    <strong>Notes:</strong> ${apt.notes}
                </div>
            ` : ''}

            ${apt.status !== 'cancelled' ? `
                <div class="appointment-actions">
                    <button class="btn-action btn-edit">Edit</button>
                    <button class="btn-action btn-cancel">Cancel</button>
                </div>
            ` : ''}
        </div>
    `;
}

// ============================================
// EDIT & CANCEL APPOINTMENTS
// ============================================

function editAppointment(aptId) {
    const apt = state.appointments.find(a => a.id === aptId);
    if (!apt) return;

    // Populate form with appointment data
    document.getElementById('appointmentDate').value = apt.date;
    document.getElementById('appointmentDate').dispatchEvent(new Event('change'));
    
    setTimeout(() => {
        const timeBtn = document.querySelector(`[data-time="${apt.time}"]`);
        if (timeBtn) {
            timeBtn.click();
        }
        
        document.getElementById('fullName').value = apt.fullName;
        document.getElementById('email').value = apt.email;
        document.getElementById('phone').value = apt.phone;
        document.getElementById('duration').value = apt.duration;
        document.getElementById('notes').value = apt.notes;

        const serviceCard = document.querySelector(`[data-service-id="${apt.service}"]`);
        if (serviceCard) {
            serviceCard.click();
        }

        switchTab('booking');
        document.querySelector('.appointment-form').scrollIntoView({ behavior: 'smooth' });

        // Remove old appointment
        state.appointments = state.appointments.filter(a => a.id !== aptId);
        saveAppointmentsToStorage();
    }, 100);
}

function cancelAppointment(aptId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    const apt = state.appointments.find(a => a.id === aptId);
    if (apt) {
        apt.status = 'cancelled';
        saveAppointmentsToStorage();
        displayAppointments();

        // Show confirmation
        alert('Appointment cancelled successfully. A cancellation confirmation has been sent to your email.');
    }
}

// ============================================
// STORAGE MANAGEMENT
// ============================================

function saveAppointmentsToStorage() {
    localStorage.setItem('appointments', JSON.stringify(state.appointments));
}

function loadAppointmentsFromStorage() {
    state.appointments = JSON.parse(localStorage.getItem('appointments')) || [];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId() {
    return 'apt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================
// CONSOLE LOGGING FOR DEVELOPMENT
// ============================================

console.log('✓ Appointment Booking System Loaded');
console.log('📊 Services Available:', SERVICES.length);
console.log('🕐 Time Slots:', TIME_SLOTS.length);
console.log('📝 Stored Appointments:', state.appointments.length);
