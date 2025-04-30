const citySelect = document.getElementById("city");

const cities = [
  { name: "Chicago, IL", lat: 41.8781, lng: -87.6298 },
  { name: "New York, NY", lat: 40.7128, lng: -74.0060 },
  { name: "Los Angeles, CA", lat: 34.0522, lng: -118.2437 },
  { name: "London, UK", lat: 51.5074, lng: -0.1278 },
  { name: "Tokyo, Japan", lat: 35.6895, lng: 139.6917 },
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
  { name: "Cairo, Egypt", lat: 30.0444, lng: 31.2357 },
  { name: "Rio de Janeiro, Brazil", lat: -22.9068, lng: -43.1729 },
  { name: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241 }
];

cities.forEach(c => {
  const o = document.createElement("option");
  o.value = `${c.lat},${c.lng}`;
  o.textContent = c.name;
  citySelect.appendChild(o);
});

document.getElementById("getData").addEventListener("click", () => {
  const parts = citySelect.value.split(",");
  if (parts.length !== 2) return;
  loadData(parts[0], parts[1]);
});

async function loadData(lat, lng) {
  clearError();
  try {
    const todayData = await fetchDay(lat, lng, "today");
    const tomorrowData = await fetchDay(lat, lng, "tomorrow");
    render(todayData, "today");
    render(tomorrowData, "tomorrow");
  } catch {
    showError("Unable to fetch data. Please try again.");
  }
}

async function fetchDay(lat, lng, day) {
  const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&date=${day}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error();
  const j = await r.json();
  if (j.status !== "OK") throw new Error();
  return j.results;
}

function render(d, t) {
  setVal(`sunrise-${t}`, d.sunrise);
  setVal(`sunset-${t}`, d.sunset);
  setVal(`dawn-${t}`, d.dawn);
  setVal(`dusk-${t}`, d.dusk);
  setVal(`solar-noon-${t}`, d.solar_noon);
  setVal(`day-length-${t}`, d.day_length);
  setVal(`timezone-${t}`, d.timezone);
}

function setVal(k, v) {
  const e = document.querySelector(`[data-key="${k}"]`);
  if (e) e.textContent = v;
}

function showError(m) {
  document.getElementById("error").textContent = m;
}

function clearError() {
  document.getElementById("error").textContent = "";
}
