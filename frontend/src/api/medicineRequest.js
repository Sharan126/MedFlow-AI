/**
 * API Service for Inter-Hospital Medicine Requisitions & Map Queries.
 */

const getApiUrl = (endpoint) => {
  // If running directly on a different host or standalone port
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return endpoint; // Proxied via Vite
  }
  return endpoint;
};

export async function sendMedicineRequest(payload) {
  try {
    const res = await fetch(getApiUrl('/api/request-medicine'), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to send medicine request");
    }

    return await res.json();
  } catch (error) {
    // Fallback direct request to backend port 8000 if proxy failed
    try {
      const resFallback = await fetch("http://localhost:8000/api/request-medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return await resFallback.json();
    } catch (e) {
      throw error;
    }
  }
}

export async function fetchNearbyHospitals(
  medicine = "Paracetamol", 
  minQuantity = 0, 
  lat = 12.3082, 
  lng = 76.6432, 
  radiusKm = 15, 
  facilityType = "all"
) {
  const query = `?medicine=${encodeURIComponent(medicine)}&min_quantity=${minQuantity}&lat=${lat}&lng=${lng}&radius_km=${radiusKm}&facility_type=${facilityType}`;
  try {
    const res = await fetch(getApiUrl(`/api/nearby-hospitals${query}`));
    if (!res.ok) {
      throw new Error("Failed to fetch nearby hospitals");
    }
    return await res.json();
  } catch (error) {
    const fallbackRes = await fetch(`http://localhost:8000/api/nearby-hospitals${query}`);
    return await fallbackRes.json();
  }
}

export async function searchOsmLocations(query) {
  if (!query || !query.trim()) return [];
  const qStr = encodeURIComponent(query.trim());
  try {
    const res = await fetch(getApiUrl(`/api/osm-geocode?q=${qStr}`));
    if (!res.ok) throw new Error("Geocode search failed");
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    try {
      const fallbackRes = await fetch(`http://localhost:8000/api/osm-geocode?q=${qStr}`);
      const data = await fallbackRes.json();
      return data.results || [];
    } catch (e) {
      return [];
    }
  }
}

export async function fetchMedicineRequests() {
  try {
    const res = await fetch(getApiUrl('/api/medicine-requests'));
    if (!res.ok) throw new Error("Failed to fetch medicine requests");
    return await res.json();
  } catch (error) {
    const fallbackRes = await fetch('http://localhost:8000/api/medicine-requests');
    return await fallbackRes.json();
  }
}

export async function updateMedicineRequestStatus(requestId, status) {
  try {
    const res = await fetch(getApiUrl(`/api/medicine-requests/${requestId}/status`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    return await res.json();
  } catch (error) {
    const fallbackRes = await fetch(`http://localhost:8000/api/medicine-requests/${requestId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    return await fallbackRes.json();
  }
}
