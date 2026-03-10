document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const registerBtn = document.getElementById('register-btn');
  const loginBtn = document.getElementById('login-btn');
  const authMessage = document.getElementById('auth-message');
  const authSection = document.getElementById('auth-section');
  const recommendationSection = document.getElementById('recommendation-section');
  const recommendationForm = document.getElementById('recommendation-form');
  const recommendationResult = document.getElementById('recommendation-result');
  const logoutBtn = document.getElementById('logout-btn');

  const saveBtn = document.getElementById('save-rec-btn');
  const downloadBtn = document.getElementById('download-rec-btn');
  const viewPastBtn = document.getElementById('view-past-rec-btn');
  const pastRecContainer = document.getElementById('past-recommendations');

  // Persistent Data in localStorage
  let usersDB = JSON.parse(localStorage.getItem('usersDB') || '[]');
  let recommendationsDB = JSON.parse(localStorage.getItem('recommendationsDB') || '{}');
  let loggedInUserEmail = localStorage.getItem('loggedInUserEmail') || null;

  // Last generated recommendation for save/download
  let lastGeneratedRecommendation = null;

  // Save DB changes to localStorage
  function saveDB() {
    localStorage.setItem('usersDB', JSON.stringify(usersDB));
    localStorage.setItem('recommendationsDB', JSON.stringify(recommendationsDB));
    if (loggedInUserEmail) {
      localStorage.setItem('loggedInUserEmail', loggedInUserEmail);
    } else {
      localStorage.removeItem('loggedInUserEmail');
    }
  }

  // Render detailed recommendation table HTML
  function renderRecommendation(rec) {
    if (!rec || !rec.fertilizers || rec.fertilizers.length === 0) {
      return "<p>No fertilizer recommendations available.</p>";
    }
    let html = <h3>Recommendations for ${rec.crop.toUpperCase()} (${rec.growthStage} stage)</h3>;
    html += <p><b>Location:</b> ${rec.location}</p>;
    html += `<table>
      <thead><tr>
        <th>Fertilizer Name</th>
        <th>Type</th>
        <th>Quantity (kg/ha)</th>
        <th>Application Timing</th>
      </tr></thead><tbody>`;
    rec.fertilizers.forEach(f => {
      html += `<tr>
        <td>${f.name}</td>
        <td>${f.type || 'N/A'}</td>
        <td>${f.quantity}</td>
        <td>${f.timing}</td>
      </tr>`;
    });
    html += </tbody></table>;
    return html;
  }

  // Show past recommendations for logged user
  function showPastRecommendations() {
    pastRecContainer.innerHTML = '';
    if (!loggedInUserEmail || !recommendationsDB[loggedInUserEmail]?.length) {
      pastRecContainer.innerHTML = "<p>No saved past recommendations found.</p>";
      pastRecContainer.style.display = 'block';
      return;
    }

    let html = <h3>Past Recommendations for ${loggedInUserEmail}</h3>;
    recommendationsDB[loggedInUserEmail].forEach(rec => {
      html += `<div class="rec">
        <strong>Date:</strong> ${new Date(rec.generatedAt).toLocaleString()}<br/>
        <strong>Crop:</strong> ${rec.crop}<br/>
        <strong>Growth Stage:</strong> ${rec.growthStage}<br/>
        <strong>Location:</strong> ${rec.location}<br/>
        <table>
          <thead><tr>
            <th>Fertilizer</th><th>Type</th><th>Quantity (kg/ha)</th><th>Timing</th>
          </tr></thead>
          <tbody>`;
      rec.fertilizers.forEach(f => {
        html += `<tr>
          <td>${f.name}</td>
          <td>${f.type}</td>
          <td>${f.quantity}</td>
          <td>${f.timing}</td>
        </tr>`;
      });
      html += "</tbody></table></div>";
    });
    pastRecContainer.innerHTML = html;
    pastRecContainer.style.display = 'block';
  }

  // Download text file helper
  function downloadTextFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Generate plain text from recommendation for download
  function generateTextDownloadContent(rec) {
    let text = Fertilizer Recommendation\nCrop: ${rec.crop}\nGrowth Stage: ${rec.growthStage}\nLocation: ${rec.location}\n\nFertilizers:\n;
    rec.fertilizers.forEach(f => {
      text += - ${f.name} (${f.type}): ${f.quantity} kg/ha; Timing: ${f.timing}\n;
    });
    return text;
  }

  // Initialize UI based on login status
  function initializeUI() {
    if (loggedInUserEmail) {
      authSection.style.display = 'none';
      recommendationSection.style.display = 'block';
      saveBtn.style.display = 'none';
      downloadBtn.style.display = 'none';
      viewPastBtn.style.display = 'none';
      pastRecContainer.style.display = 'none';
      recommendationResult.innerHTML = '';

      // Show past recommendations if exist
      if (recommendationsDB[loggedInUserEmail] && recommendationsDB[loggedInUserEmail].length > 0) {
        viewPastBtn.style.display = 'inline-block';
      }
      return;
    }
    // If logged out
    authSection.style.display = 'block';
    recommendationSection.style.display = 'none';
    pastRecContainer.style.display = 'none';
    authMessage.textContent = '';
    recommendationResult.innerHTML = '';
  }

  // Register Button Event
  registerBtn.addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    authMessage.style.color = 'red';
    if (!name || !email || !password) {
      authMessage.textContent = 'Please fill all fields';
      return;
    }

    if (usersDB.find(u => u.email === email)) {
      authMessage.textContent = 'User already exists, please login';
      return;
    }

    usersDB.push({ name, email, password, role });
    recommendationsDB[email] = [];
    loggedInUserEmail = email;
    saveDB();

    authMessage.style.color = 'green';
    authMessage.textContent = 'Registration successful! Redirecting...';

    setTimeout(() => {
      authMessage.textContent = '';
      initializeUI();
      document.getElementById('auth-form').reset();
    }, 1000);
  });

  // Login Button Event
  loginBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    authMessage.style.color = 'red';
    let user = usersDB.find(u => u.email === email && u.password === password);
    if (!user) {
      authMessage.textContent = 'Invalid email or password';
      return;
    }

    loggedInUserEmail = email;
    saveDB();
    authMessage.style.color = 'green';
    authMessage.textContent = 'Login successful! Redirecting...';

    setTimeout(() => {
      authMessage.textContent = '';
      initializeUI();
      document.getElementById('auth-form').reset();
    }, 1000);
  });

  // Logout Button Event
  logoutBtn.addEventListener('click', () => {
    loggedInUserEmail = null;
    lastGeneratedRecommendation = null;
    saveDB();
    initializeUI();
  });

  // Recommendation Form Event
  recommendationForm.addEventListener('submit', e => {
    e.preventDefault();

    if (!loggedInUserEmail) {
      recommendationResult.style.color = 'red';
      recommendationResult.textContent = 'Please login first.';
      return;
    }

    // Read inputs
    const location = document.getElementById('location').value.trim();
    const crop = document.getElementById('crop-select').value;
    const ph = parseFloat(document.getElementById('ph').value);
    const n = parseFloat(document.getElementById('n').value);
    const p = parseFloat(document.getElementById('p').value);
    const k = parseFloat(document.getElementById('k').value);
    const growthStage = document.getElementById('growth-stage').value;

    if (!location || !crop || isNaN(ph) || isNaN(n) || isNaN(p) || isNaN(k) || !growthStage) {
      recommendationResult.style.color = 'red';
      recommendationResult.textContent = 'Please fill all fields correctly.';
      return;
    }

    // Fertilizer data: name → type
    const fertilizerData = {
      'Urea': 'Nitrogen Fertilizer',
      'DAP': 'Phosphorus Fertilizer',
      'MOP': 'Potassium Fertilizer',
      'Balanced NPK fertilizer': 'Mixed Fertilizer'
    };

    // Build fertilizer recommendation logic
    let fertilizers = [];

    if (crop === 'rice' && growthStage === 'vegetative') {
      if (n < 15) {
        fertilizers.push({
          name: 'Urea',
          type: fertilizerData['Urea'],
          quantity: 50,
          timing: 'Now and after 20 days'
        });
      }
      if (p < 10) {
        fertilizers.push({
          name: 'DAP',
          type: fertilizerData['DAP'],
          quantity: 30,
          timing: 'Immediately'
        });
      }
      if (k < 10) {
        fertilizers.push({
          name: 'MOP',
          type: fertilizerData['MOP'],
          quantity: 20,
          timing: 'At sowing'
        });
      }
    } else {
      fertilizers.push({
        name: 'Balanced NPK fertilizer',
        type: fertilizerData['Balanced NPK fertilizer'],
        quantity: 40,
        timing: 'Follow crop schedule'
      });
    }

    lastGeneratedRecommendation = {
      location,
      crop,
      growthStage,
      ph,
      soilN: n,
      soilP: p,
      soilK: k,
      fertilizers,
      generatedAt: new Date().toISOString()
    };

    recommendationResult.style.color = '#1a5276';
    recommendationResult.innerHTML = renderRecommendation(lastGeneratedRecommendation);

    // Show save/download buttons and hide past recommendations list
    saveBtn.style.display = 'inline-block';
    downloadBtn.style.display = 'inline-block';
    viewPastBtn.style.display = 'none';
    pastRecContainer.style.display = 'none';
  });

  // Save recommendation event
  saveBtn.addEventListener('click', () => {
    if (!loggedInUserEmail || !lastGeneratedRecommendation) {
      alert('No recommendation to save or you are not logged in.');
      return;
    }
    if (!recommendationsDB[loggedInUserEmail]) {
      recommendationsDB[loggedInUserEmail] = [];
    }
    recommendationsDB[loggedInUserEmail].push(lastGeneratedRecommendation);
    saveDB();

    alert('Recommendation saved successfully!');
    saveBtn.style.display = 'none';
    downloadBtn.style.display = 'none';
    viewPastBtn.style.display = 'inline-block';
  });

  // Download recommendation event
  downloadBtn.addEventListener('click', () => {
    if (!lastGeneratedRecommendation) {
      alert('No recommendation to download.');
      return;
    }
    const content = generateTextDownloadContent(lastGeneratedRecommendation);
    downloadTextFile(content, Recommendation_${lastGeneratedRecommendation.crop}_${new Date().toISOString().slice(0, 10)}.txt);

    // Reveal view past recommendations button after download
    viewPastBtn.style.display = 'inline-block';
  });

  // View past recommendations event
  viewPastBtn.addEventListener('click', () => {
    showPastRecommendations();
    pastRecContainer.style.display = 'block';
  });

  // Initialize UI on page load
  initializeUI();
});
