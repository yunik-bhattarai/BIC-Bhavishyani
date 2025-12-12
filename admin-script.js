// Admin Panel Script
document.addEventListener('DOMContentLoaded', function() {
    // Load and display data
    loadData();
    
    // Setup event listeners
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('clearData').addEventListener('click', clearData);
    document.getElementById('simulateHack').addEventListener('click', simulateHack);
    
    // Modal close button
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('detailModal').style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('detailModal')) {
            document.getElementById('detailModal').style.display = 'none';
        }
    });
});

// Load and display all collected data
function loadData() {
    const data = JSON.parse(localStorage.getItem('bhavishyaniData') || '{"submissions": []}');
    const submissions = data.submissions || [];
    
    // Update stats
    updateStats(submissions);
    
    // Populate table
    populateTable(submissions);
    
    // Show insights
    showInsights(submissions);
}

// Update statistics
function updateStats(submissions) {
    document.getElementById('totalSubmissions').textContent = submissions.length;
    
    const emails = new Set();
    const phones = new Set();
    const birthdays = new Set();
    
    submissions.forEach(sub => {
        if (sub.personal.email) emails.add(sub.personal.email);
        if (sub.personal.phone) phones.add(sub.personal.phone);
        if (sub.personal.birthDate) birthdays.add(sub.personal.birthDate);
    });
    
    document.getElementById('totalEmails').textContent = emails.size;
    document.getElementById('totalPhones').textContent = phones.size;
    document.getElementById('totalBirthdays').textContent = birthdays.size;
}

// Populate data table
function populateTable(submissions) {
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = '';
    
    submissions.forEach((sub, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${sub.personal.fullName || 'N/A'}</td>
            <td>${sub.personal.email || 'N/A'}</td>
            <td>${sub.personal.phone || 'N/A'}</td>
            <td>${sub.personal.birthDate || 'N/A'}</td>
            <td>${sub.personal.birthPlace || 'N/A'}</td>
            <td>${sub.personal.profession || 'N/A'}</td>
            <td>${new Date(sub.timestamp).toLocaleString() || 'N/A'}</td>
            <td><button class="view-btn" data-index="${index}">View Details</button></td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            showDetails(submissions[index]);
        });
    });
}

// Show user details in modal
function showDetails(userData) {
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="data-detail">
            <div class="data-category">
                <h3><i class="fas fa-user"></i> Personal Information</h3>
                ${createDataItem('Full Name', userData.personal.fullName)}
                ${createDataItem('Gender', userData.personal.gender)}
                ${createDataItem('Email', userData.personal.email)}
                ${createDataItem('Phone', userData.personal.phone)}
                ${createDataItem('Birth Date', userData.personal.birthDate)}
                ${createDataItem('Birth Time', userData.personal.birthTime)}
                ${createDataItem('Birth Place', userData.personal.birthPlace)}
                ${createDataItem('Marital Status', userData.personal.maritalStatus)}
                ${createDataItem('Profession', userData.personal.profession)}
                ${createDataItem('Concerns', userData.personal.concerns?.join(', ') || 'None')}
            </div>
            
            <div class="data-category">
                <h3><i class="fas fa-map-marker-alt"></i> Location & Device</h3>
                ${createDataItem('IP Address', userData.ip)}
                ${createDataItem('Timezone', userData.deviceInfo?.timezone)}
                ${createDataItem('Browser Language', userData.deviceInfo?.language)}
                ${createDataItem('Device Platform', userData.deviceInfo?.platform)}
                ${createDataItem('Screen Size', userData.deviceInfo?.screenSize)}
                ${createDataItem('User Agent', userData.deviceInfo?.userAgent)}
            </div>
            
            <div class="data-category">
                <h3><i class="fas fa-chart-line"></i> Behavioral Data</h3>
                ${createDataItem('Time on Page', userData.behavioral?.timeOnPage ? `${Math.floor(userData.behavioral.timeOnPage / 60)}m ${userData.behavioral.timeOnPage % 60}s` : 'N/A')}
                ${createDataItem('Form Completion Time', userData.behavioral?.formCompletionTime ? `${userData.behavioral.formCompletionTime} seconds` : 'N/A')}
                ${createDataItem('Mouse Movements', userData.behavioral?.mouseMovements || 'N/A')}
                ${createDataItem('Clicked Premium Offer', userData.behavioral?.clickedPremium ? 'Yes' : 'No')}
            </div>
            
            <div class="data-category">
                <h3><i class="fas fa-calendar"></i> Submission Info</h3>
                ${createDataItem('Submission Time', new Date(userData.timestamp).toLocaleString())}
                ${createDataItem('Data ID', userData.timestamp)}
            </div>
        </div>
    `;
    
    document.getElementById('detailModal').style.display = 'flex';
}

// Helper function to create data item HTML
function createDataItem(label, value) {
    return `
        <div class="data-item">
            <div class="data-label">${label}:</div>
            <div class="data-value">${value || 'Not provided'}</div>
        </div>
    `;
}

// Show data insights
function showInsights(submissions) {
    // Common locations
    const locations = {};
    submissions.forEach(sub => {
        const location = sub.personal.birthPlace;
        if (location) {
            locations[location] = (locations[location] || 0) + 1;
        }
    });
    
    const commonLocations = document.getElementById('commonLocations');
    commonLocations.innerHTML = Object.entries(locations)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([loc, count]) => `<li>${loc}: <span class="count">${count}</span></li>`)
        .join('');
    
    // Professions
    const professions = {};
    submissions.forEach(sub => {
        const profession = sub.personal.profession;
        if (profession && profession !== 'Not provided') {
            professions[profession] = (professions[profession] || 0) + 1;
        }
    });
    
    const professionsList = document.getElementById('professionsList');
    professionsList.innerHTML = Object.entries(professions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([prof, count]) => `<li>${prof}: <span class="count">${count}</span></li>`)
        .join('');
    
    if (Object.keys(professions).length === 0) {
        professionsList.innerHTML = '<li>No profession data collected</li>';
    }
    
    // Concerns
    const concerns = {};
    submissions.forEach(sub => {
        if (sub.personal.concerns) {
            sub.personal.concerns.forEach(concern => {
                concerns[concern] = (concerns[concern] || 0) + 1;
            });
        }
    });
    
    const concernsList = document.getElementById('concernsList');
    concernsList.innerHTML = Object.entries(concerns)
        .sort((a, b) => b[1] - a[1])
        .map(([concern, count]) => `<li>${concern.charAt(0).toUpperCase() + concern.slice(1)}: <span class="count">${count}</span></li>`)
        .join('');
    
    // Age distribution
    const ageGroups = {
        'Under 20': 0,
        '20-29': 0,
        '30-39': 0,
        '40-49': 0,
        '50-59': 0,
        '60+': 0
    };
    
    submissions.forEach(sub => {
        const birthYear = parseInt(sub.personal.birthDate?.split('/')[2]);
        if (!isNaN(birthYear)) {
            const age = new Date().getFullYear() - birthYear;
            if (age < 20) ageGroups['Under 20']++;
            else if (age < 30) ageGroups['20-29']++;
            else if (age < 40) ageGroups['30-39']++;
            else if (age < 50) ageGroups['40-49']++;
            else if (age < 60) ageGroups['50-59']++;
            else ageGroups['60+']++;
        }
    });
    
    const ageDistribution = document.getElementById('ageDistribution');
    ageDistribution.innerHTML = Object.entries(ageGroups)
        .filter(([_, count]) => count > 0)
        .map(([group, count]) => `<li>${group}: <span class="count">${count}</span></li>`)
        .join('');
}

// Export data as JSON file
function exportData() {
    const data = JSON.parse(localStorage.getItem('bhavishyaniData') || '{"submissions": []}');
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bhavishyani-collected-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Data exported successfully! This demonstrates how easily collected data can be extracted.');
}

// Clear all data
function clearData() {
    if (confirm('Are you sure you want to delete ALL collected data? This action cannot be undone.')) {
        localStorage.removeItem('bhavishyaniData');
        alert('All data has been cleared. This is what SHOULD happen when you request data deletion from legitimate services.');
        loadData(); // Refresh the display
    }
}

// Simulate data breach
function simulateHack() {
    const data = JSON.parse(localStorage.getItem('bhavishyaniData') || '{"submissions": []}');
    
    if (data.submissions.length === 0) {
        alert('No data to simulate breach. Submit some data first from the main site.');
        return;
    }
    
    // Create dramatic breach simulation
    const breachModal = document.createElement('div');
    breachModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 2000;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'Roboto Mono', monospace;
    `;
    
    breachModal.innerHTML = `
        <div style="background: #000; color: #0f0; padding: 30px; border: 2px solid #0f0; max-width: 800px; width: 90%;">
            <h2 style="color: #f00; margin-bottom: 20px;">⚠️ DATA BREACH SIMULATION ⚠️</h2>
            <div id="hackTerminal" style="height: 400px; overflow-y: auto; background: #111; padding: 20px; font-size: 14px; line-height: 1.5;">
                <div>> Initializing breach simulation...</div>
                <div>> Connecting to database...</div>
                <div>> Bypassing security protocols...</div>
                <div>> Accessing user data table...</div>
                <div>> Extracting ${data.submissions.length} records...</div>
                <div style="margin-top: 20px; color: #ff0;">
                    > CRITICAL: ${data.submissions.length} user profiles compromised
                </div>
                <div>> Email addresses: ${new Set(data.submissions.map(s => s.personal.email)).size}</div>
                <div>> Phone numbers: ${new Set(data.submissions.map(s => s.personal.phone)).size}</div>
                <div>> Birth dates: ${new Set(data.submissions.map(s => s.personal.birthDate)).size}</div>
                <div style="margin-top: 20px; color: #f00;">
                    > DATA NOW AVAILABLE ON DARK WEB
                </div>
                <div>> Estimated value: $${data.submissions.length * 50} (black market)</div>
                <div>> Potential identity theft cases: ${data.submissions.length}</div>
                <div>> Phishing campaigns possible: ${new Set(data.submissions.map(s => s.personal.email)).size * 10}</div>
                <div style="margin-top: 20px;">
                    > This is what happens when data is not properly secured
                </div>
                <div>> Always verify website security before submitting data</div>
            </div>
            <button id="closeHack" style="margin-top: 20px; background: #f00; color: white; border: none; padding: 10px 20px; cursor: pointer; font-family: inherit;">
                Close Simulation
            </button>
        </div>
    `;
    
    document.body.appendChild(breachModal);
    
    // Animate the terminal
    const terminal = document.getElementById('hackTerminal');
    let lines = terminal.innerHTML.split('<br>').filter(l => l.trim());
    terminal.innerHTML = '';
    
    let i = 0;
    function typeLine() {
        if (i < lines.length) {
            terminal.innerHTML += lines[i] + '<br>';
            terminal.scrollTop = terminal.scrollHeight;
            i++;
            setTimeout(typeLine, 300);
        }
    }
    
    setTimeout(typeLine, 500);
    
    // Close button
    document.getElementById('closeHack').addEventListener('click', () => {
        document.body.removeChild(breachModal);
    });
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        if (document.body.contains(breachModal)) {
            document.body.removeChild(breachModal);
        }
    }, 10000);
}