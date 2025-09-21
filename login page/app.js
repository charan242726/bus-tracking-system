// Transport Tracking Application JavaScript - Fixed Version

// Application data
const appData = {
  buses: [
    {
      id: "BUS001",
      routeId: "RT001",
      routeName: "City Center - Airport",
      status: "running",
      currentLocation: {
        lat: 28.6139,
        lng: 77.2090,
        address: "Connaught Place, New Delhi"
      },
      speed: 35,
      nextStop: "Rajiv Gandhi International Airport",
      estimatedArrival: "15 mins",
      passengerCount: 32,
      capacity: 50,
      driver: "Rajesh Kumar",
      lastUpdated: "2025-09-15T22:57:00Z"
    },
    {
      id: "BUS002",
      routeId: "RT002",
      routeName: "Railway Station - Mall",
      status: "idle",
      currentLocation: {
        lat: 28.6428,
        lng: 77.2194,
        address: "New Delhi Railway Station"
      },
      speed: 0,
      nextStop: "Select City Walk Mall",
      estimatedArrival: "Waiting",
      passengerCount: 8,
      capacity: 45,
      driver: "Amit Singh",
      lastUpdated: "2025-09-15T22:55:00Z"
    },
    {
      id: "BUS003",
      routeId: "RT003",
      routeName: "University - IT Park",
      status: "offline",
      currentLocation: {
        lat: 28.5355,
        lng: 77.3910,
        address: "Delhi University"
      },
      speed: 0,
      nextStop: "DLF IT Park",
      estimatedArrival: "Service unavailable",
      passengerCount: 0,
      capacity: 40,
      driver: "Suresh Yadav",
      lastUpdated: "2025-09-15T22:30:00Z"
    },
    {
      id: "BUS004",
      routeId: "RT001",
      routeName: "City Center - Airport",
      status: "running",
      currentLocation: {
        lat: 28.5562,
        lng: 77.1000,
        address: "IGI Airport Terminal 1"
      },
      speed: 28,
      nextStop: "Connaught Place",
      estimatedArrival: "22 mins",
      passengerCount: 18,
      capacity: 50,
      driver: "Vikram Singh",
      lastUpdated: "2025-09-15T22:56:00Z"
    },
    {
      id: "BUS005",
      routeId: "RT004",
      routeName: "Hospital - Market",
      status: "running",
      currentLocation: {
        lat: 28.6304,
        lng: 77.2177,
        address: "AIIMS Hospital"
      },
      speed: 25,
      nextStop: "Karol Bagh Market",
      estimatedArrival: "12 mins",
      passengerCount: 41,
      capacity: 45,
      driver: "Manoj Kumar",
      lastUpdated: "2025-09-15T22:57:00Z"
    }
  ],
  routes: [
    {
      id: "RT001",
      name: "City Center - Airport",
      stops: [
        { name: "Connaught Place", time: "6:00 AM", lat: 28.6139, lng: 77.2090 },
        { name: "India Gate", time: "6:15 AM", lat: 28.6129, lng: 77.2295 },
        { name: "Khan Market", time: "6:30 AM", lat: 28.5984, lng: 77.2319 },
        { name: "Terminal 1", time: "7:00 AM", lat: 28.5562, lng: 77.1000 },
        { name: "Terminal 3", time: "7:15 AM", lat: 28.5665, lng: 77.1031 }
      ],
      frequency: "Every 30 minutes",
      operatingHours: "5:30 AM - 11:30 PM",
      distance: "28.5 km",
      duration: "75 minutes"
    },
    {
      id: "RT002",
      name: "Railway Station - Mall",
      stops: [
        { name: "New Delhi Railway Station", time: "6:00 AM", lat: 28.6428, lng: 77.2194 },
        { name: "Paharganj", time: "6:10 AM", lat: 28.6467, lng: 77.2106 },
        { name: "Karol Bagh", time: "6:25 AM", lat: 28.6514, lng: 77.1906 },
        { name: "Rajouri Garden", time: "6:45 AM", lat: 28.6479, lng: 77.1204 },
        { name: "Select City Walk Mall", time: "7:00 AM", lat: 28.5245, lng: 77.2066 }
      ],
      frequency: "Every 20 minutes",
      operatingHours: "5:00 AM - 12:00 AM",
      distance: "22.3 km",
      duration: "60 minutes"
    },
    {
      id: "RT003",
      name: "University - IT Park",
      stops: [
        { name: "Delhi University", time: "7:00 AM", lat: 28.5355, lng: 77.3910 },
        { name: "Civil Lines", time: "7:15 AM", lat: 28.6774, lng: 77.2274 },
        { name: "IP Extension", time: "7:35 AM", lat: 28.6139, lng: 77.2773 },
        { name: "Noida Sector 18", time: "8:00 AM", lat: 28.5692, lng: 77.3294 },
        { name: "DLF IT Park", time: "8:20 AM", lat: 28.5748, lng: 77.3654 }
      ],
      frequency: "Every 25 minutes",
      operatingHours: "6:30 AM - 10:30 PM",
      distance: "35.2 km",
      duration: "80 minutes"
    },
    {
      id: "RT004",
      name: "Hospital - Market",
      stops: [
        { name: "AIIMS Hospital", time: "6:30 AM", lat: 28.6304, lng: 77.2177 },
        { name: "Safdarjung", time: "6:45 AM", lat: 28.5729, lng: 77.2085 },
        { name: "Green Park", time: "7:00 AM", lat: 28.5601, lng: 77.2056 },
        { name: "Lajpat Nagar", time: "7:20 AM", lat: 28.5656, lng: 77.2431 },
        { name: "Karol Bagh Market", time: "7:40 AM", lat: 28.6514, lng: 77.1906 }
      ],
      frequency: "Every 15 minutes",
      operatingHours: "5:45 AM - 11:45 PM",
      distance: "18.7 km",
      duration: "70 minutes"
    }
  ],
  alerts: [
    {
      id: "ALT001",
      type: "warning",
      title: "Route Delay",
      message: "Bus BUS001 is running 8 minutes behind schedule due to heavy traffic",
      timestamp: "2025-09-15T22:45:00Z",
      busId: "BUS001",
      severity: "medium"
    },
    {
      id: "ALT002",
      type: "error",
      title: "GPS Disconnected",
      message: "Lost GPS connection for Bus BUS003. Last known location: Delhi University",
      timestamp: "2025-09-15T22:30:00Z",
      busId: "BUS003",
      severity: "high"
    },
    {
      id: "ALT003",
      type: "info",
      title: "Route Optimization",
      message: "New optimal route suggested for RT002 to reduce travel time by 5 minutes",
      timestamp: "2025-09-15T21:15:00Z",
      routeId: "RT002",
      severity: "low"
    },
    {
      id: "ALT004",
      type: "warning",
      title: "High Passenger Load",
      message: "Bus BUS005 is at 91% capacity. Consider deploying additional bus",
      timestamp: "2025-09-15T22:50:00Z",
      busId: "BUS005",
      severity: "medium"
    }
  ],
  schedules: [
    {
      routeId: "RT001",
      routeName: "City Center - Airport",
      weekdaySchedule: [
        { departure: "5:30 AM", arrival: "6:45 AM" },
        { departure: "6:00 AM", arrival: "7:15 AM" },
        { departure: "6:30 AM", arrival: "7:45 AM" },
        { departure: "7:00 AM", arrival: "8:15 AM" },
        { departure: "7:30 AM", arrival: "8:45 AM" },
        { departure: "8:00 AM", arrival: "9:15 AM" }
      ],
      weekendSchedule: [
        { departure: "6:00 AM", arrival: "7:15 AM" },
        { departure: "7:00 AM", arrival: "8:15 AM" },
        { departure: "8:00 AM", arrival: "9:15 AM" },
        { departure: "9:00 AM", arrival: "10:15 AM" }
      ]
    },
    {
      routeId: "RT002",
      routeName: "Railway Station - Mall",
      weekdaySchedule: [
        { departure: "5:00 AM", arrival: "6:00 AM" },
        { departure: "5:20 AM", arrival: "6:20 AM" },
        { departure: "5:40 AM", arrival: "6:40 AM" },
        { departure: "6:00 AM", arrival: "7:00 AM" },
        { departure: "6:20 AM", arrival: "7:20 AM" },
        { departure: "6:40 AM", arrival: "7:40 AM" }
      ],
      weekendSchedule: [
        { departure: "6:00 AM", arrival: "7:00 AM" },
        { departure: "6:30 AM", arrival: "7:30 AM" },
        { departure: "7:00 AM", arrival: "8:00 AM" },
        { departure: "7:30 AM", arrival: "8:30 AM" }
      ]
    }
  ],
  statistics: {
    totalBuses: 5,
    runningBuses: 3,
    idleBuses: 1,
    offlineBuses: 1,
    totalRoutes: 4,
    activeAlerts: 4,
    averageDelay: "5.2 minutes",
    dailyPassengers: 1247,
    fuelEfficiency: "85.3%",
    onTimePerformance: "88.7%"
  }
};

// Application state
let currentUser = null;
let currentPage = 'dashboard';
let currentTheme = 'light';
let updateInterval = null;
let charts = {};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  setupEventListeners();
  checkAuthState();
  initializeTheme();
}

function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Navigation
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', handleNavigation);
  });

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Schedule toggles
  const scheduleToggles = document.querySelectorAll('[data-schedule]');
  scheduleToggles.forEach(toggle => {
    toggle.addEventListener('click', handleScheduleToggle);
  });

  // Filters
  const routeFilter = document.getElementById('routeFilter');
  const statusFilter = document.getElementById('statusFilter');
  
  if (routeFilter) routeFilter.addEventListener('change', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
}

function checkAuthState() {
  // Check if user is logged in (simulate with localStorage)
  const savedUser = localStorage.getItem('smartTransitUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showMainApp();
  } else {
    showLoginPage();
  }
}

function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('loginBtn');
  const btnText = loginBtn.querySelector('.btn-text');
  const spinner = loginBtn.querySelector('.loading-spinner');
  
  // Show loading state
  btnText.textContent = 'Signing In...';
  spinner.classList.remove('hidden');
  loginBtn.disabled = true;
  
  // Simulate API call
  setTimeout(() => {
    if (email && password) {
      // Successful login
      currentUser = {
        id: 1,
        name: 'Admin User',
        email: email,
        role: 'admin'
      };
      
      localStorage.setItem('smartTransitUser', JSON.stringify(currentUser));
      showMainApp();
    } else {
      // Reset form
      btnText.textContent = 'Sign In';
      spinner.classList.add('hidden');
      loginBtn.disabled = false;
      alert('Please enter valid credentials');
    }
  }, 1500);
}

function handleLogout() {
  localStorage.removeItem('smartTransitUser');
  currentUser = null;
  clearUpdateInterval();
  showLoginPage();
}

function showLoginPage() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  
  // Initialize main app components
  initializeDashboard();
  populateRouteFilter();
  startRealTimeUpdates();
  
  // Load current page
  showPage(currentPage);
}

function handleNavigation(e) {
  e.preventDefault();
  
  const navItem = e.currentTarget;
  const page = navItem.getAttribute('data-page');
  
  // Ensure we have a valid page
  if (!page) return;
  
  // Update active navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  navItem.classList.add('active');
  
  // Show page
  showPage(page);
}

function showPage(pageName) {
  if (!pageName) return;
  
  currentPage = pageName;
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show current page
  const currentPageEl = document.getElementById(pageName + 'Page');
  if (currentPageEl) {
    currentPageEl.classList.add('active');
    
    // Load page-specific content with a small delay to ensure DOM is ready
    setTimeout(() => {
      switch(pageName) {
        case 'dashboard':
          loadDashboard();
          break;
        case 'tracking':
          loadTracking();
          break;
        case 'routes':
          loadRoutes();
          break;
        case 'schedules':
          loadSchedules();
          break;
        case 'alerts':
          loadAlerts();
          break;
        case 'reports':
          loadReports();
          break;
        case 'settings':
          loadSettings();
          break;
        default:
          console.log('Unknown page:', pageName);
      }
    }, 50);
  }
}

function initializeDashboard() {
  updateStatistics();
  loadDashboardAlerts();
  initializeDashboardMap();
}

function updateStatistics() {
  const stats = calculateStatistics();
  
  const runningBusesEl = document.getElementById('runningBuses');
  const idleBusesEl = document.getElementById('idleBuses');
  const offlineBusesEl = document.getElementById('offlineBuses');
  const totalBusesEl = document.getElementById('totalBuses');
  
  if (runningBusesEl) runningBusesEl.textContent = stats.runningBuses;
  if (idleBusesEl) idleBusesEl.textContent = stats.idleBuses;
  if (offlineBusesEl) offlineBusesEl.textContent = stats.offlineBuses;
  if (totalBusesEl) totalBusesEl.textContent = stats.totalBuses;
}

function calculateStatistics() {
  const runningBuses = appData.buses.filter(bus => bus.status === 'running').length;
  const idleBuses = appData.buses.filter(bus => bus.status === 'idle').length;
  const offlineBuses = appData.buses.filter(bus => bus.status === 'offline').length;
  
  return {
    runningBuses,
    idleBuses,
    offlineBuses,
    totalBuses: appData.buses.length
  };
}

function loadDashboard() {
  updateStatistics();
  loadDashboardAlerts();
}

function loadDashboardAlerts() {
  const alertsContainer = document.getElementById('recentAlerts');
  if (!alertsContainer) return;
  
  const recentAlerts = appData.alerts.slice(0, 4);
  
  alertsContainer.innerHTML = recentAlerts.map(alert => `
    <div class="alert-item alert-item--${alert.type}">
      <div class="alert-title">${alert.title}</div>
      <div class="alert-message">${alert.message}</div>
      <div class="alert-time">${formatTime(alert.timestamp)}</div>
    </div>
  `).join('');
}

function initializeDashboardMap() {
  const mapContainer = document.getElementById('dashboardMap');
  if (mapContainer) {
    mapContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--color-text-secondary);">
        <i class="fas fa-map-marked-alt" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p>Real-time bus locations</p>
        <p style="font-size: 12px;">${appData.buses.filter(b => b.status === 'running').length} buses currently running</p>
      </div>
    `;
  }
}

function loadTracking() {
  loadBusList();
  initializeTrackingMap();
}

function loadBusList() {
  const busListContainer = document.getElementById('busList');
  if (!busListContainer) return;
  
  const filteredBuses = getFilteredBuses();
  
  busListContainer.innerHTML = filteredBuses.map(bus => `
    <div class="bus-item" data-bus-id="${bus.id}">
      <div class="bus-header">
        <div class="bus-id">${bus.id}</div>
        <div class="bus-status bus-status--${bus.status}">${bus.status.toUpperCase()}</div>
      </div>
      <div class="bus-route">${bus.routeName}</div>
      <div class="bus-info">
        <div>Next: ${bus.nextStop}</div>
        <div>ETA: ${bus.estimatedArrival}</div>
        <div>Passengers: ${bus.passengerCount}/${bus.capacity}</div>
      </div>
    </div>
  `).join('');
}

function initializeTrackingMap() {
  const mapContainer = document.getElementById('trackingMapContainer');
  if (mapContainer) {
    mapContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: var(--color-bg-1); color: var(--color-text-secondary);">
        <i class="fas fa-map" style="font-size: 64px; margin-bottom: 24px; opacity: 0.5;"></i>
        <h3>Interactive Bus Tracking Map</h3>
        <p>Real-time locations of all buses</p>
        <div style="margin-top: 20px; display: flex; gap: 16px; flex-wrap: wrap;">
          <span style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 12px; height: 12px; background: var(--color-success); border-radius: 50%;"></div>
            Running (${appData.buses.filter(b => b.status === 'running').length})
          </span>
          <span style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 12px; height: 12px; background: var(--color-warning); border-radius: 50%;"></div>
            Idle (${appData.buses.filter(b => b.status === 'idle').length})
          </span>
          <span style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 12px; height: 12px; background: var(--color-error); border-radius: 50%;"></div>
            Offline (${appData.buses.filter(b => b.status === 'offline').length})
          </span>
        </div>
      </div>
    `;
  }
}

function loadRoutes() {
  const routesContainer = document.getElementById('routesList');
  if (!routesContainer) return;
  
  routesContainer.innerHTML = appData.routes.map(route => `
    <div class="route-card">
      <div class="route-header">
        <div class="route-name">${route.name}</div>
      </div>
      <div class="route-details">
        <div class="route-detail">
          <div class="route-detail-label">Distance</div>
          <div class="route-detail-value">${route.distance}</div>
        </div>
        <div class="route-detail">
          <div class="route-detail-label">Duration</div>
          <div class="route-detail-value">${route.duration}</div>
        </div>
        <div class="route-detail">
          <div class="route-detail-label">Frequency</div>
          <div class="route-detail-value">${route.frequency}</div>
        </div>
        <div class="route-detail">
          <div class="route-detail-label">Operating Hours</div>
          <div class="route-detail-value">${route.operatingHours}</div>
        </div>
      </div>
      <div class="route-stops">
        <h4>Stops (${route.stops.length})</h4>
        <div class="stops-list">
          ${route.stops.map(stop => stop.name).join(' • ')}
        </div>
      </div>
    </div>
  `).join('');
}

function loadSchedules() {
  const schedulesContainer = document.getElementById('schedulesContent');
  if (!schedulesContainer) return;
  
  const scheduleType = document.querySelector('[data-schedule].active')?.getAttribute('data-schedule') || 'weekday';
  
  schedulesContainer.innerHTML = appData.schedules.map(schedule => `
    <div class="schedule-route">
      <h3>${schedule.routeName}</h3>
      <div class="schedule-table">
        <div class="schedule-header">Departure</div>
        <div class="schedule-header">Arrival</div>
        <div class="schedule-header">Status</div>
        ${schedule[scheduleType + 'Schedule'].map(entry => `
          <div class="schedule-cell">${entry.departure}</div>
          <div class="schedule-cell">${entry.arrival}</div>
          <div class="schedule-cell">
            <span class="status status--success">On Time</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function loadAlerts() {
  const alertsContainer = document.getElementById('alertsList');
  if (!alertsContainer) return;
  
  alertsContainer.innerHTML = appData.alerts.map(alert => `
    <div class="alert-card alert-card--${alert.type}">
      <div class="alert-card-header">
        <h4>${alert.title}</h4>
        <div class="alert-severity alert-severity--${alert.severity}">${alert.severity}</div>
      </div>
      <p>${alert.message}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-xs); color: var(--color-text-secondary);">
        <span>${formatTime(alert.timestamp)}</span>
        <span>${alert.busId || alert.routeId || 'System'}</span>
      </div>
    </div>
  `).join('');
}

function loadReports() {
  setTimeout(() => {
    initializeCharts();
  }, 100);
}

function initializeCharts() {
  // Bus Utilization Chart
  const utilizationCtx = document.getElementById('utilizationChart');
  if (utilizationCtx && !charts.utilization) {
    charts.utilization = new Chart(utilizationCtx, {
      type: 'doughnut',
      data: {
        labels: ['Running', 'Idle', 'Offline'],
        datasets: [{
          data: [3, 1, 1],
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  // Route Performance Chart
  const performanceCtx = document.getElementById('performanceChart');
  if (performanceCtx && !charts.performance) {
    charts.performance = new Chart(performanceCtx, {
      type: 'bar',
      data: {
        labels: ['RT001', 'RT002', 'RT003', 'RT004'],
        datasets: [{
          label: 'On-Time Performance (%)',
          data: [88, 92, 76, 95],
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  // Passenger Chart
  const passengerCtx = document.getElementById('passengerChart');
  if (passengerCtx && !charts.passenger) {
    charts.passenger = new Chart(passengerCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Daily Passengers',
          data: [1200, 1350, 1180, 1420, 1380, 980, 850],
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Punctuality Chart
  const punctualityCtx = document.getElementById('punctualityChart');
  if (punctualityCtx && !charts.punctuality) {
    charts.punctuality = new Chart(punctualityCtx, {
      type: 'radar',
      data: {
        labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
        datasets: [{
          label: 'Punctuality Score',
          data: [85, 78, 92, 88],
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.2)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }
}

function loadSettings() {
  // Settings page is already rendered in HTML with forms and preferences
  console.log('Settings page loaded');
}

function populateRouteFilter() {
  const routeFilter = document.getElementById('routeFilter');
  if (!routeFilter) return;
  
  // Clear existing options except "All Routes"
  const allOption = routeFilter.querySelector('option[value=""]');
  routeFilter.innerHTML = '';
  if (allOption) {
    routeFilter.appendChild(allOption);
  } else {
    const newAllOption = document.createElement('option');
    newAllOption.value = '';
    newAllOption.textContent = 'All Routes';
    routeFilter.appendChild(newAllOption);
  }
  
  // Add route options
  appData.routes.forEach(route => {
    const option = document.createElement('option');
    option.value = route.id;
    option.textContent = route.name;
    routeFilter.appendChild(option);
  });
}

function getFilteredBuses() {
  const routeFilter = document.getElementById('routeFilter')?.value;
  const statusFilter = document.getElementById('statusFilter')?.value;
  
  let filteredBuses = appData.buses;
  
  if (routeFilter) {
    filteredBuses = filteredBuses.filter(bus => bus.routeId === routeFilter);
  }
  
  if (statusFilter) {
    filteredBuses = filteredBuses.filter(bus => bus.status === statusFilter);
  }
  
  return filteredBuses;
}

function applyFilters() {
  if (currentPage === 'tracking') {
    loadBusList();
  }
}

function handleScheduleToggle(e) {
  e.preventDefault();
  
  // Update active toggle
  document.querySelectorAll('[data-schedule]').forEach(toggle => {
    toggle.classList.remove('active');
  });
  e.target.classList.add('active');
  
  // Reload schedules
  loadSchedules();
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-color-scheme', currentTheme);
  
  const themeIcon = document.querySelector('#themeToggle i');
  if (themeIcon) {
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
  
  localStorage.setItem('smartTransitTheme', currentTheme);
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('smartTransitTheme');
  if (savedTheme) {
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-color-scheme', currentTheme);
    
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
      themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
}

function startRealTimeUpdates() {
  clearUpdateInterval();
  updateInterval = setInterval(() => {
    simulateRealTimeData();
    updateStatistics();
    if (currentPage === 'dashboard') {
      loadDashboardAlerts();
    } else if (currentPage === 'tracking') {
      loadBusList();
    } else if (currentPage === 'alerts') {
      loadAlerts();
    }
  }, 8000); // Update every 8 seconds
}

function clearUpdateInterval() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

function simulateRealTimeData() {
  // Randomly update bus positions and status
  appData.buses.forEach(bus => {
    if (bus.status === 'running') {
      // Simulate movement
      bus.currentLocation.lat += (Math.random() - 0.5) * 0.001;
      bus.currentLocation.lng += (Math.random() - 0.5) * 0.001;
      bus.speed = Math.max(0, bus.speed + (Math.random() - 0.5) * 10);
      
      // Update passenger count
      bus.passengerCount = Math.max(0, Math.min(bus.capacity, 
        bus.passengerCount + Math.floor((Math.random() - 0.5) * 6)));
    }
    
    bus.lastUpdated = new Date().toISOString();
  });
  
  // Occasionally change bus status
  if (Math.random() < 0.1) {
    const randomBus = appData.buses[Math.floor(Math.random() * appData.buses.length)];
    if (randomBus.status === 'idle' && Math.random() < 0.3) {
      randomBus.status = 'running';
    } else if (randomBus.status === 'running' && Math.random() < 0.1) {
      randomBus.status = 'idle';
    }
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  clearUpdateInterval();
});