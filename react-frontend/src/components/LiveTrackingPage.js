import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/live-tracking.css';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Import Leaflet dynamically to avoid SSR issues
let L = null;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  // Fix for default markers
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const LiveTrackingPage = () => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [buses, setBuses] = useState([]);
  const [busMarkers, setBusMarkers] = useState({});
  const [userLocationMarker, setUserLocationMarker] = useState(null);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);
  const [refreshRate, setRefreshRate] = useState(30000);
  const [showHistorical, setShowHistorical] = useState(false);
  const [currentView, setCurrentView] = useState('map');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showBusPopup, setShowBusPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBuses, setFilteredBuses] = useState([]);

  // Initialize map
  useEffect(() => {
    if (!L) return; // Check if Leaflet is loaded
    
    if (mapRef.current && !map) {
      const leafletMap = L.map(mapRef.current).setView([16.5449, 81.5212], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(leafletMap);

      setMap(leafletMap);
      loadBusData();
      
      // Start auto refresh after a short delay
      setTimeout(() => {
        startAutoRefresh();
      }, 1000);
    }

    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        setAutoRefreshInterval(null);
      }
    };
  }, [loadBusData, startAutoRefresh]);

  // Load bus data
  const loadBusData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Generate mock bus data for demo
      const mockBuses = generateMockBuses();
      setBuses(mockBuses);
      setFilteredBuses(mockBuses);
      if (map) {
        updateBusMarkers(mockBuses);
      }
      setIsLoading(false);
      announceToScreenReader(`${t('notification.busUpdated')} - ${mockBuses.length} buses`);
    } catch (error) {
      console.error('Error loading bus data:', error);
      setIsLoading(false);
    }
  }, [t, map, updateBusMarkers, announceToScreenReader]);

  // Generate mock bus data
  const generateMockBuses = () => {
    const routes = ['R1', 'R2', 'R3', 'E1', 'E2', 'L1', 'L2', 'L3'];
    const destinations = ['Central Station', 'Airport', 'University', 'Tech Park', 'Shopping Mall', 'Hospital'];
    const statuses = ['active', 'delayed', 'stopped'];
    
    const mockBuses = [];
    for (let i = 1; i <= 20; i++) {
      mockBuses.push({
        id: `BUS${String(i).padStart(3, '0')}`,
        route: routes[Math.floor(Math.random() * routes.length)],
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        lat: 16.5449 + (Math.random() - 0.5) * 0.1,
        lng: 81.5212 + (Math.random() - 0.5) * 0.1,
        speed: Math.floor(Math.random() * 60) + 10,
        direction: Math.floor(Math.random() * 360),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        capacity: Math.floor(Math.random() * 100),
        driver: `Driver ${i}`,
        nextStops: generateNextStops(),
        type: i <= 5 ? 'express' : (i <= 15 ? 'local' : 'regular')
      });
    }
    return mockBuses;
  };

  // Generate next stops
  const generateNextStops = () => {
    const stops = ['Main Square', 'City Center', 'Park Avenue', 'Station Road', 'Market Street'];
    const nextStops = [];
    for (let i = 0; i < 3; i++) {
      nextStops.push({
        name: stops[Math.floor(Math.random() * stops.length)],
        eta: `${Math.floor(Math.random() * 15) + 1} min`
      });
    }
    return nextStops;
  };

  // Update bus markers on map
  const updateBusMarkers = useCallback((busData) => {
    if (!map || !L) return;
    
    const newMarkers = {};
    busData.forEach(bus => {
      if (busMarkers[bus.id]) {
        busMarkers[bus.id].setLatLng([bus.lat, bus.lng]);
        newMarkers[bus.id] = busMarkers[bus.id];
      } else {
        const icon = L.divIcon({
          className: 'bus-marker',
          html: `<div class="bus-marker-content ${bus.status === 'active' ? 'moving' : ''}">${bus.route}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        
        const marker = L.marker([bus.lat, bus.lng], { icon })
          .addTo(map)
          .on('click', () => handleBusSelect(bus));
        
        newMarkers[bus.id] = marker;
      }
    });
    
    setBusMarkers(newMarkers);
  }, [map, busMarkers]);

  // Handle bus selection
  const handleBusSelect = useCallback((bus) => {
    setSelectedBusId(bus.id);
    setSelectedBus(bus);
    if (map) {
      map.setView([bus.lat, bus.lng], 15);
    }
    setShowBusPopup(true);
    announceToScreenReader(`${t('notification.busSelected')} ${bus.id}`);
  }, [map, t]);

  // Filter buses by type
  const filterBusesByType = (buses, filter) => {
    switch(filter) {
      case 'express':
        return buses.filter(b => b.type === 'express');
      case 'local':
        return buses.filter(b => b.type === 'local');
      case 'delayed':
        return buses.filter(b => b.status === 'delayed');
      case 'nearby':
        return buses.slice(0, 5);
      case 'route':
        return buses.filter(b => b.route === 'R1' || b.route === 'R2');
      default:
        return buses;
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredBuses(filterBusesByType(buses, activeFilter));
      return;
    }
    
    const filtered = buses.filter(bus => 
      bus.id.toLowerCase().includes(query.toLowerCase()) ||
      bus.route.toLowerCase().includes(query.toLowerCase()) ||
      bus.destination.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredBuses(filtered);
    announceToScreenReader(`Found ${filtered.length} buses`);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    const filtered = filterBusesByType(buses, filter);
    setFilteredBuses(filtered);
  };

  // Start auto refresh
  const startAutoRefresh = useCallback(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
    
    const interval = setInterval(() => {
      // Simulate bus movement
      setBuses(prevBuses => {
        const updatedBuses = prevBuses.map(bus => ({
          ...bus,
          lat: bus.lat + (Math.random() - 0.5) * 0.002,
          lng: bus.lng + (Math.random() - 0.5) * 0.002,
          speed: Math.floor(Math.random() * 60) + 10,
          capacity: Math.min(100, Math.max(0, bus.capacity + Math.floor(Math.random() * 20 - 10)))
        }));
        
        updateBusMarkers(updatedBuses);
        setFilteredBuses(filterBusesByType(updatedBuses, activeFilter));
        return updatedBuses;
      });
    }, refreshRate);
    
    setAutoRefreshInterval(interval);
  }, [autoRefreshInterval, refreshRate, activeFilter, updateBusMarkers]);


  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (userLocationMarker && map) {
            map.removeLayer(userLocationMarker);
          }
          
          if (map) {
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: 'user-location',
                html: '<div style="background: #4f46e5; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })
            }).addTo(map);
            
            setUserLocationMarker(marker);
            map.setView([lat, lng], 14);
          }
          
          announceToScreenReader(t('notification.locationFound'));
        },
        error => {
          alert(t('notification.locationError'));
        }
      );
    }
  };

  // Announce to screen reader
  const announceToScreenReader = useCallback((message) => {
    // This would be handled by aria-live regions in a real app
    console.log('Screen Reader:', message);
  }, []);

  // Get direction from degrees
  const getDirection = (degrees) => {
    const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <div className="live-tracking-page">
      {/* Main Container */}
      <div className="main-container">
        {/* Control Panel */}
        <div className={`control-panel ${isPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-header">
            <h2 className="panel-title">{t('tracking.title')}</h2>
            <div className="view-toggles">
              <button 
                className={`view-toggle ${currentView === 'map' ? 'active' : ''}`}
                onClick={() => setCurrentView('map')}
              >
                <i className="fas fa-map"></i> <span>{t('tracking.mapView')}</span>
              </button>
              <button 
                className={`view-toggle ${currentView === 'list' ? 'active' : ''}`}
                onClick={() => setCurrentView('list')}
              >
                <i className="fas fa-list"></i> <span>{t('tracking.listView')}</span>
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="search-section">
            <input 
              type="text" 
              className="search-input" 
              placeholder={t('tracking.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                <i className="fas fa-globe"></i> {t('tracking.filterAll')}
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'route' ? 'active' : ''}`}
                onClick={() => handleFilterChange('route')}
              >
                <i className="fas fa-route"></i> {t('tracking.filterRoute')}
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'nearby' ? 'active' : ''}`}
                onClick={() => handleFilterChange('nearby')}
              >
                <i className="fas fa-location-arrow"></i> {t('tracking.filterNearby')}
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'express' ? 'active' : ''}`}
                onClick={() => handleFilterChange('express')}
              >
                <i className="fas fa-bolt"></i> {t('tracking.filterExpress')}
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'local' ? 'active' : ''}`}
                onClick={() => handleFilterChange('local')}
              >
                <i className="fas fa-map-pin"></i> {t('tracking.filterLocal')}
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'delayed' ? 'active' : ''}`}
                onClick={() => handleFilterChange('delayed')}
              >
                <i className="fas fa-clock"></i> {t('tracking.filterDelayed')}
              </button>
            </div>
          </div>

          {/* Settings Section */}
          <div className="settings-section">
            <div className="setting-item">
              <span className="setting-label">{t('tracking.autoRefresh')}</span>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked onChange={(e) => {
                  if (e.target.checked) {
                    startAutoRefresh();
                  } else if (autoRefreshInterval) {
                    clearInterval(autoRefreshInterval);
                  }
                }} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <span className="setting-label">{t('tracking.refreshRate')}</span>
              <select 
                className="refresh-select" 
                value={refreshRate / 1000}
                onChange={(e) => {
                  setRefreshRate(e.target.value * 1000);
                  startAutoRefresh();
                }}
              >
                <option value="10">10 {t('time.seconds')}</option>
                <option value="30">30 {t('time.seconds')}</option>
                <option value="60">1 {t('time.minute')}</option>
                <option value="300">5 {t('time.minutes')}</option>
              </select>
            </div>
            <div className="setting-item">
              <span className="setting-label">{t('tracking.showTraffic')}</span>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <span className="setting-label">{t('tracking.soundAlerts')}</span>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <span className="setting-label">{t('tracking.highContrast')}</span>
              <label className="toggle-switch">
                <input type="checkbox" onChange={(e) => {
                  document.body.style.filter = e.target.checked ? 'contrast(1.5)' : 'none';
                }} />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Bus List */}
          <div className="bus-list">
            {filteredBuses.map(bus => (
              <div 
                key={bus.id}
                className={`bus-item ${selectedBusId === bus.id ? 'active' : ''}`}
                onClick={() => handleBusSelect(bus)}
              >
                <div className="bus-header">
                  <span className="bus-number">{bus.id}</span>
                  <div className="bus-status">
                    <span className={`status-indicator ${bus.status}`}></span>
                    <span>{t(`status.${bus.status}`)}</span>
                  </div>
                </div>
                <div className="bus-info">
                  <div className="info-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{bus.destination}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-tachometer-alt"></i>
                    <span>{bus.speed} km/h</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-users"></i>
                    <span>{bus.capacity}% full</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-route"></i>
                    <span>Route {bus.route}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="map-container">
          <button 
            className="toggle-panel" 
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          >
            <i className="fas fa-bars"></i>
          </button>
          
          <div ref={mapRef} id="map" style={{width: '100%', height: '100%'}}></div>
          
          <button className="location-btn" onClick={getUserLocation}>
            <i className="fas fa-crosshairs"></i>
          </button>
          
          <button className="history-btn" onClick={() => setShowHistorical(!showHistorical)}>
            <i className="fas fa-history"></i>
          </button>

          {/* Bus Info Popup */}
          {showBusPopup && selectedBus && (
            <div className="bus-popup" style={{display: 'block'}}>
              <div className="popup-header">
                <h3 className="popup-title">{t('tracking.busInfo')}</h3>
                <button className="close-popup" onClick={() => setShowBusPopup(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="popup-content">
                <div className="popup-section">
                  <div className="popup-label">{t('tracking.busNumber')}</div>
                  <div className="popup-value">{selectedBus.id}</div>
                </div>
                
                <div className="popup-section">
                  <div className="popup-label">{t('tracking.route')}</div>
                  <div className="popup-value">{selectedBus.route} - {selectedBus.destination}</div>
                </div>
                
                <div className="popup-section">
                  <div className="popup-label">{t('tracking.speed')}</div>
                  <div className="popup-value">{selectedBus.speed} km/h - {getDirection(selectedBus.direction)}</div>
                </div>
                
                <div className="popup-section">
                  <div className="popup-label">{t('tracking.driver')}</div>
                  <div className="popup-value">{selectedBus.driver}</div>
                </div>
                
                <div className="popup-section">
                  <div className="popup-label">{t('tracking.capacity')}</div>
                  <div className="capacity-bar">
                    <div className="capacity-fill" style={{width: `${selectedBus.capacity}%`}}></div>
                    <div className="capacity-text">{selectedBus.capacity}% Full</div>
                  </div>
                </div>
                
                <div className="popup-section">
                  <div className="popup-label">{t('tracking.nextStops')}</div>
                  <div className="next-stops">
                    {selectedBus.nextStops.map((stop, index) => (
                      <div key={index} className="stop-item">
                        <span className="stop-name">{stop.name}</span>
                        <span className="stop-eta">{stop.eta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <div className="loading-text">{t('tracking.loading')}</div>
            </div>
          )}
        </div>
      </div>

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true"></div>
    </div>
  );
};

export default LiveTrackingPage;
