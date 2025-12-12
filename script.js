// Data storage object
let collectedData = {
    personal: {},
    behavioral: {},
    timestamp: null,
    ip: "Loading...",
    deviceInfo: {}
};

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    // Populate date dropdowns
    populateDateDropdowns();
    
    // Setup form submission
    document.getElementById('astrologyForm').addEventListener('submit', handleFormSubmit);
    
    // Setup modal controls
    document.getElementById('closeResults').addEventListener('click', () => {
        document.getElementById('resultsScreen').style.display = 'none';
    });
    
    document.getElementById('closeReveal').addEventListener('click', () => {
        document.getElementById('dataReveal').style.display = 'none';
    });
    
    document.getElementById('viewData').addEventListener('click', showDataReveal);
    document.getElementById('premiumOffer').addEventListener('click', showPremiumOffer);
    document.getElementById('resetDemo').addEventListener('click', resetDemo);
    document.getElementById('privacyLink').addEventListener('click', showFakePrivacy);
    
    // Track user behavior
    startBehaviorTracking();
    
    // Try to get IP (educational purposes only)
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            collectedData.ip = data.ip;
        })
        .catch(() => {
            collectedData.ip = "Could not retrieve (demo)";
        });
    
    // Get device info
    collectedData.deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
});

// Populate date dropdowns
function populateDateDropdowns() {
    // Days
    const daySelect = document.getElementById('birthDay');
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
    
    // Years (from 1900 to current year)
    const yearSelect = document.getElementById('birthYear');
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1900; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Collect all form data
    collectedData.personal = {
        fullName: document.getElementById('fullName').value,
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        birthDate: `${document.getElementById('birthDay').value}/${document.getElementById('birthMonth').value}/${document.getElementById('birthYear').value}`,
        birthTime: document.getElementById('birthTime').value || 'Not provided',
        birthPlace: document.getElementById('birthPlace').value,
        maritalStatus: document.getElementById('maritalStatus').value,
        profession: document.getElementById('profession').value,
        concerns: Array.from(document.querySelectorAll('input[name="concerns"]:checked')).map(cb => cb.value)
    };
    
    collectedData.timestamp = new Date().toISOString();
    
    // Save to localStorage for admin panel
    saveToLocalStorage();
    
    // Show loading screen
    showLoadingScreen();
    
    // After delay, show results
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        generateAstrologyReport();
        document.getElementById('resultsScreen').style.display = 'flex';
    }, 3000);
}

// Show loading screen with progress animation
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressBar = document.querySelector('.progress');
    
    loadingScreen.style.display = 'flex';
    
    // Animate progress bar
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width += 1;
            progressBar.style.width = width + '%';
        }
    }, 30);
}

// Generate fake astrology report
function generateAstrologyReport() {
    const name = collectedData.personal.fullName.split(' ')[0] || "Seeker";
    const birthYear = document.getElementById('birthYear').value;
    const age = new Date().getFullYear() - parseInt(birthYear);
    
    // Zodiac sign based on birth date
    const month = parseInt(document.getElementById('birthMonth').value);
    const day = parseInt(document.getElementById('birthDay').value);
    const zodiacSign = getZodiacSign(month, day);
    
    // Generate reports
    document.getElementById('personalAnalysis').innerHTML = `
        Dear ${name}, based on your birth details, your Vedic chart shows you are a ${zodiacSign}. 
        Your ruling planet indicates a personality that is both intuitive and analytical. 
        At ${age} years, you are entering a significant phase of life where major transformations are possible.
    `;
    
    document.getElementById('careerForecast').innerHTML = `
        The planets indicate a career shift within the next 6 months. Your ${collectedData.personal.profession || "current field"} 
        will present new opportunities. Jupiter's position suggests financial gains, but be cautious around 
        October-November. Consider upskilling in technology-related areas.
    `;
    
    document.getElementById('loveForecast').innerHTML = `
        Venus is favorably positioned in your relationship sector. ${
            collectedData.personal.maritalStatus === 'single' ? 
            'You may meet someone significant within 3 months, possibly through social gatherings.' :
            'Your existing relationships will deepen, but communication is key to avoid misunderstandings.'
        }
        The period around your birthday is especially auspicious for love matters.
    `;
    
    document.getElementById('healthInsights').innerHTML = `
        Pay attention to ${age > 40 ? 'joint health and regular checkups' : 'stress management and digestion'}. 
        The planetary alignment suggests incorporating meditation or yoga into your routine. 
        Avoid major dietary changes during planetary retrogrades.
    `;
    
    document.getElementById('challenges').innerHTML = `
        Saturn's transit indicates some challenges in ${collectedData.personal.concerns.includes('career') ? 'career advancement' : 'personal projects'}. 
        Remain patient and avoid rushed decisions between December-February. 
        Financially, be conservative with investments in the coming year.
    `;
}

// Get zodiac sign from date
function getZodiacSign(month, day) {
    const signs = [
        {name: "Capricorn", start: {month: 12, day: 22}, end: {month: 1, day: 19}},
        {name: "Aquarius", start: {month: 1, day: 20}, end: {month: 2, day: 18}},
        {name: "Pisces", start: {month: 2, day: 19}, end: {month: 3, day: 20}},
        {name: "Aries", start: {month: 3, day: 21}, end: {month: 4, day: 19}},
        {name: "Taurus", start: {month: 4, day: 20}, end: {month: 5, day: 20}},
        {name: "Gemini", start: {month: 5, day: 21}, end: {month: 6, day: 20}},
        {name: "Cancer", start: {month: 6, day: 21}, end: {month: 7, day: 22}},
        {name: "Leo", start: {month: 7, day: 23}, end: {month: 8, day: 22}},
        {name: "Virgo", start: {month: 8, day: 23}, end: {month: 9, day: 22}},
        {name: "Libra", start: {month: 9, day: 23}, end: {month: 10, day: 22}},
        {name: "Scorpio", start: {month: 10, day: 23}, end: {month: 11, day: 21}},
        {name: "Sagittarius", start: {month: 11, day: 22}, end: {month: 12, day: 21}}
    ];
    
    for (const sign of signs) {
        if ((month === sign.start.month && day >= sign.start.day) || 
            (month === sign.end.month && day <= sign.end.day)) {
            return sign.name;
        }
    }
    return "Unknown";
}

// Show data collection reveal
function showDataReveal() {
    document.getElementById('resultsScreen').style.display = 'none';
    
    // Populate collected data
    const personalList = document.getElementById('collectedPersonal');
    personalList.innerHTML = '';
    
    for (const [key, value] of Object.entries(collectedData.personal)) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${key}:</strong> ${value}`;
        personalList.appendChild(li);
    }
    
    const locationList = document.getElementById('collectedLocation');
    locationList.innerHTML = `
        <li><strong>IP Address:</strong> ${collectedData.ip}</li>
        <li><strong>Timezone:</strong> ${collectedData.deviceInfo.timezone}</li>
        <li><strong>Browser Language:</strong> ${collectedData.deviceInfo.language}</li>
        <li><strong>Device:</strong> ${collectedData.deviceInfo.userAgent.substring(0, 50)}...</li>
        <li><strong>Screen Resolution:</strong> ${collectedData.deviceInfo.screenSize}</li>
    `;
    
    const behavioralList = document.getElementById('collectedBehavioral');
    behavioralList.innerHTML = `
        <li><strong>Time spent on page:</strong> ${Math.floor(collectedData.behavioral.timeOnPage / 60)} minutes ${collectedData.behavioral.timeOnPage % 60} seconds</li>
        <li><strong>Form completion time:</strong> ${collectedData.behavioral.formCompletionTime || 'N/A'} seconds</li>
        <li><strong>Clicked premium offer:</strong> ${collectedData.behavioral.clickedPremium ? 'Yes' : 'No'}</li>
        <li><strong>Mouse movements tracked:</strong> ${collectedData.behavioral.mouseMovements || 0}</li>
    `;
    
    document.getElementById('dataReveal').style.display = 'flex';
}

// Show fake premium offer
function showPremiumOffer() {
    collectedData.behavioral.clickedPremium = true;
    saveToLocalStorage();
    
    alert("This demonstrates how websites upsell after collecting your data.\n\nIn reality:\n1. Your data would be used to personalize pricing\n2. Payment would collect even more sensitive info\n3. You might be signed up for recurring charges\n\nAlways verify websites before purchasing!");
}

// Show fake privacy policy
function showFakePrivacy(e) {
    e.preventDefault();
    alert(`FAKE PRIVACY POLICY EXAMPLE:\n\n"By using our service, you agree that:\n1. We collect all data you provide\n2. We may share data with 'partners'\n3. We use cookies and tracking technologies\n4. We are not responsible for data breaches\n5. You cannot opt out of data collection"\n\nReal privacy policies are often long and confusing. Always read them carefully!`);
}

// Save data to localStorage
function saveToLocalStorage() {
    let allData = JSON.parse(localStorage.getItem('bhavishyaniData') || '{"submissions": []}');
    allData.submissions.push(collectedData);
    localStorage.setItem('bhavishyaniData', JSON.stringify(allData));
}

// Start tracking user behavior
function startBehaviorTracking() {
    let startTime = Date.now();
    let mouseMoveCount = 0;
    let formStartTime = null;
    
    // Track time on page
    setInterval(() => {
        collectedData.behavioral.timeOnPage = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);
    
    // Track mouse movements
    document.addEventListener('mousemove', () => {
        mouseMoveCount++;
        collectedData.behavioral.mouseMovements = mouseMoveCount;
    });
    
    // Track form interaction
    const form = document.getElementById('astrologyForm');
    form.addEventListener('focusin', () => {
        if (!formStartTime) {
            formStartTime = Date.now();
        }
    });
    
    form.addEventListener('submit', () => {
        if (formStartTime) {
            collectedData.behavioral.formCompletionTime = Math.floor((Date.now() - formStartTime) / 1000);
        }
    });
}

// Reset demonstration
function resetDemo() {
    if (confirm("Reset the demonstration and clear all collected data?")) {
        localStorage.removeItem('bhavishyaniData');
        document.getElementById('astrologyForm').reset();
        document.getElementById('dataReveal').style.display = 'none';
        
        // Reset collectedData
        collectedData = {
            personal: {},
            behavioral: {},
            timestamp: null,
            ip: "Loading...",
            deviceInfo: {}
        };
        
        alert("Demonstration reset! Try submitting the form again to see how data is collected.");
    }
}

// Photo upload functionality
document.getElementById('uploadArea').addEventListener('click', function() {
    document.getElementById('palmPhoto').click();
});

document.getElementById('palmPhoto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById('photoPreview');
            preview.src = event.target.result;
            preview.style.display = 'block';
            
            document.getElementById('retakeBtn').style.display = 'inline-flex';
            document.getElementById('analyzeBtn').style.display = 'inline-flex';
            
            // Store photo data
            collectedData.palmPhoto = event.target.result;
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('retakeBtn').addEventListener('click', function() {
    document.getElementById('palmPhoto').value = '';
    document.getElementById('photoPreview').style.display = 'none';
    this.style.display = 'none';
    document.getElementById('analyzeBtn').style.display = 'none';
});

document.getElementById('analyzeBtn').addEventListener('click', function() {
    alert('Palm analysis would be performed here. This demonstrates how websites can collect biometric data through photos.');
});