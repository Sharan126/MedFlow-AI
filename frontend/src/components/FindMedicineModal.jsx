import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, X, Send, MapPin, CheckCircle, AlertCircle, Package, ArrowUpRight } from 'lucide-react';
import { sendMedicineRequest, fetchNearbyHospitals } from '../api/medicineRequest';
import './FindMedicineModal.css';

// Ensure default leaflet marker asset paths don't 404
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Mysuru District Center
const MYSURU_CENTER = [12.9716, 77.5946];

// Standard essential medicines list
const MEDICINE_OPTIONS = [
  "Paracetamol",
  "Amoxicillin",
  "Ibuprofen",
  "Insulin",
  "ORS",
  "Ciprofloxacin",
  "Metformin",
  "Omeprazole"
];

// Helper to re-render map correctly inside modal viewport
function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Marker Icon Factory
function createHospitalIcon(hasEnough, isRequested) {
  if (isRequested) {
    return L.divIcon({
      className: 'custom-map-marker marker-requested',
      html: `
        <div style="background:#3b82f6;width:32px;height:32px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 0 12px rgba(59,130,246,0.7);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;cursor:pointer;">
          ✓
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }

  if (hasEnough) {
    return L.divIcon({
      className: 'custom-map-marker marker-green',
      html: `
        <div style="background:#10b981;width:30px;height:30px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 0 12px rgba(16,185,129,0.7);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;cursor:pointer;">
          H
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  }

  return L.divIcon({
    className: 'custom-map-marker marker-yellow',
    html: `
      <div style="background:#f59e0b;width:30px;height:30px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 0 12px rgba(245,158,11,0.7);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;cursor:pointer;">
        H
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
}

export default function FindMedicineModal({ isOpen, onClose, onRequestSuccess }) {
  const [selectedMedicine, setSelectedMedicine] = useState("Paracetamol");
  const [quantityNeeded, setQuantityNeeded] = useState(1000);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestedHospitals, setRequestedHospitals] = useState({});
  const [reqQuantities, setReqQuantities] = useState({});
  const [sendingRequest, setSendingRequest] = useState(false);
  const [toast, setToast] = useState(null);

  // Close popup ref mapping
  const markerRefs = useRef({});

  // Trigger toast notification
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch nearby hospitals for selected medicine and quantity
  const handleSearchHospitals = async () => {
    setLoading(true);
    try {
      const data = await fetchNearbyHospitals(selectedMedicine, Number(quantityNeeded) || 0);
      const fetched = data.hospitals || [];
      setHospitals(fetched);

      // Prepopulate request quantities with the filter quantity
      const initQtys = {};
      fetched.forEach(h => {
        initQtys[h.name] = quantityNeeded;
      });
      setReqQuantities(prev => ({ ...initQtys, ...prev }));
    } catch (err) {
      console.error("Failed to fetch nearby hospitals:", err);
      showToast('error', '❌ Failed to fetch nearby hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load hospitals whenever modal opens or medicine/quantity changes
  useEffect(() => {
    if (isOpen) {
      handleSearchHospitals();
    }
  }, [isOpen]);

  // Filter hospitals: ONLY show hospitals that have medicine stock > 0
  const visibleHospitals = useMemo(() => {
    return hospitals.filter(h => (h.stock || 0) > 0);
  }, [hospitals]);

  // Summary statistics
  const totalAvailableStock = useMemo(() => {
    return visibleHospitals.reduce((acc, h) => acc + (h.stock || 0), 0);
  }, [visibleHospitals]);

  // Handler: Send Requisition Request
  const handleSendRequest = async (hospital) => {
    const qtyToSend = Number(reqQuantities[hospital.name]) || Number(quantityNeeded) || 1000;
    setSendingRequest(true);

    const payload = {
      from_hospital: "City General Hospital", // Current user's hospital node
      to_hospital: hospital.name,
      medicine: selectedMedicine,
      quantity: qtyToSend,
      timestamp: new Date().toISOString()
    };

    try {
      const result = await sendMedicineRequest(payload);
      if (result && result.success !== false) {
        showToast('success', `✅ Request sent to ${hospital.name}`);
        
        // Mark hospital as requested (turns marker BLUE with checkmark)
        setRequestedHospitals(prev => ({
          ...prev,
          [`${hospital.name}_${selectedMedicine}`]: true
        }));

        // Close the popup if open
        if (markerRefs.current[hospital.name]) {
          markerRefs.current[hospital.name].closePopup();
        }

        if (onRequestSuccess) {
          onRequestSuccess(payload);
        }
      } else {
        throw new Error(result?.detail || "Request failed");
      }
    } catch (err) {
      console.error("Requisition failed:", err);
      showToast('error', '❌ Failed to send request. Try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="find-medicine-overlay" onClick={onClose}>
      <div 
        className="find-medicine-container" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Alert */}
        {toast && (
          <div className={`map-toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* TOP BAR (filters) */}
        <div className="find-medicine-topbar">
          <div className="topbar-left">
            <div className="topbar-title">
              <span>🗺️</span>
              <span>Find Medicine Nearby</span>
            </div>
          </div>

          <div className="topbar-filters">
            {/* Select Medicine */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="select-med-map">Select Medicine</label>
              <select
                id="select-med-map"
                className="filter-select"
                value={selectedMedicine}
                onChange={(e) => setSelectedMedicine(e.target.value)}
              >
                {MEDICINE_OPTIONS.map((med) => (
                  <option key={med} value={med}>{med}</option>
                ))}
              </select>
            </div>

            {/* Quantity Needed */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="input-qty-map">Quantity Needed</label>
              <input
                id="input-qty-map"
                type="number"
                min="1"
                step="50"
                className="filter-input"
                value={quantityNeeded}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuantityNeeded(val);
                }}
              />
            </div>

            {/* Search Button */}
            <button
              id="btn-search-nearby-hospitals"
              className="btn-search-map"
              onClick={handleSearchHospitals}
              disabled={loading}
            >
              <Search size={15} />
              <span>{loading ? 'Searching...' : '🔍 Search Nearby Hospitals'}</span>
            </button>

            {/* Close Button */}
            <button
              id="btn-close-medicine-map"
              className="btn-close-map"
              onClick={onClose}
              title="Close Map"
            >
              <X size={16} />
              <span>✕ Close Map</span>
            </button>
          </div>
        </div>

        {/* MAIN AREA (map) */}
        <div className="find-medicine-map-container">
          <MapContainer
            center={MYSURU_CENTER}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <MapAutoResize />

            {/* Free OpenStreetMap Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render Hospital Markers */}
            {visibleHospitals.map((hospital) => {
              const lat = hospital.location?.lat || MYSURU_CENTER[0];
              const lng = hospital.location?.lng || MYSURU_CENTER[1];
              const address = hospital.location?.address || `${hospital.name}, Mysuru`;
              const isRequested = Boolean(requestedHospitals[`${hospital.name}_${selectedMedicine}`]);
              const hasEnough = hospital.stock >= Number(quantityNeeded);

              return (
                <Marker
                  key={hospital.name}
                  position={[lat, lng]}
                  icon={createHospitalIcon(hasEnough, isRequested)}
                  ref={(ref) => {
                    if (ref) markerRefs.current[hospital.name] = ref;
                  }}
                >
                  <Popup>
                    <div className="popup-header">
                      <div className="popup-hospital-name">{hospital.name}</div>
                      <div className="popup-hospital-address">
                        <MapPin size={12} color="#06b6d4" />
                        <span>{address}</span>
                      </div>
                    </div>

                    <div className="popup-details">
                      <div className="popup-stat-row">
                        <span className="popup-stat-label">Medicine:</span>
                        <span className="popup-stat-val" style={{ color: '#38bdf8' }}>{selectedMedicine}</span>
                      </div>
                      <div className="popup-stat-row">
                        <span className="popup-stat-label">Available Stock:</span>
                        <span className="popup-stat-val stock">{hospital.stock} units</span>
                      </div>
                      <div className="popup-stat-row">
                        <span className="popup-stat-label">Surplus Available:</span>
                        <span className="popup-stat-val surplus">{hospital.surplus} units</span>
                      </div>
                    </div>

                    {/* Quantity prompt input inside popup */}
                    <div className="popup-req-box">
                      <label className="popup-req-label" htmlFor={`req-input-${hospital.name}`}>
                        Requisition quantity ({selectedMedicine}):
                      </label>
                      <input 
                        id={`req-input-${hospital.name}`}
                        type="number"
                        min="1"
                        max={hospital.stock}
                        className="popup-req-input"
                        value={reqQuantities[hospital.name] ?? quantityNeeded}
                        onChange={(e) => {
                          const v = e.target.value;
                          setReqQuantities(prev => ({ ...prev, [hospital.name]: v }));
                        }}
                      />
                    </div>

                    <button
                      id={`btn-send-request-${hospital.name.replace(/\s+/g, '-').toLowerCase()}`}
                      className="btn-popup-send"
                      onClick={() => handleSendRequest(hospital)}
                      disabled={sendingRequest || isRequested}
                    >
                      <Send size={14} />
                      <span>{isRequested ? '✅ Request Already Sent' : '📤 Send Request'}</span>
                    </button>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* BOTTOM BAR (summary) */}
        <div className="find-medicine-bottombar">
          <div className="bottombar-stats">
            <div className="stat-chip">
              <Package size={16} color="#06b6d4" />
              <span>Found <strong>{visibleHospitals.length}</strong> hospitals with <strong>{selectedMedicine}</strong> in stock</span>
            </div>
            <div className="stat-chip">
              <span>Total available: <strong>{totalAvailableStock.toLocaleString()}</strong> units across the network</span>
            </div>
          </div>

          <div className="legend-row">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#10b981' }} />
              <span>Stock ≥ {quantityNeeded}</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#f59e0b' }} />
              <span>Stock &lt; {quantityNeeded}</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#3b82f6' }} />
              <span>Requested</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
