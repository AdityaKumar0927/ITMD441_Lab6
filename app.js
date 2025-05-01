/* === app.js – fetch sunrise/sunset data and wire up UI === */

const citySelect  = document.getElementById("city");
const geoBtn      = document.getElementById("geoBtn");
const getDataBtn  = document.getElementById("getData");

/* === quick handles for current-day card === */
const sunriseNow  = document.getElementById("sunriseNow");
const sunsetNow   = document.getElementById("sunsetNow");
const lenNow      = document.getElementById("lenNow");
const noonNow     = document.getElementById("noonNow");
const dawnNow     = document.getElementById("dawnNow");
const duskNow     = document.getElementById("duskNow");
const currentDate = document.getElementById("currentDate");
const daylightBar = document.getElementById("daylightBar");

/* === tab switching === */
const tabToday        = document.getElementById("tabToday");
const tabTomorrow     = document.getElementById("tabTomorrow");
const detailsToday    = document.getElementById("detailsToday");
const detailsTomorrow = document.getElementById("detailsTomorrow");

/* === populate city list === */
const cities = [
  { name:"Chicago, IL",        lat:41.8781,  lng:-87.6298 },
  { name:"New York, NY",       lat:40.7128,  lng:-74.0060 },
  { name:"Los Angeles, CA",    lat:34.0522,  lng:-118.2437 },
  { name:"London, UK",         lat:51.5074,  lng:-0.1278  },
  { name:"Tokyo, Japan",       lat:35.6895,  lng:139.6917 },
  { name:"Sydney, Australia",  lat:-33.8688, lng:151.2093 },
  { name:"Paris, France",      lat:48.8566,  lng:2.3522   },
  { name:"Cairo, Egypt",       lat:30.0444,  lng:31.2357  },
  { name:"Rio de Janeiro, BR", lat:-22.9068, lng:-43.1729 },
  { name:"Cape Town, RSA",     lat:-33.9249, lng:18.4241  }
];

cities.forEach(c=>{
  const o = document.createElement("option");
  o.value = `${c.lat},${c.lng}`;
  o.textContent = c.name;
  citySelect.appendChild(o);
});

/* === city-based fetch === */
getDataBtn.addEventListener("click",()=>{
  const [lat,lng] = citySelect.value.split(",");
  if(lat && lng) loadData(lat,lng);
});

/* === geolocation-based fetch (bonus) === */
geoBtn.addEventListener("click",()=>{
  if(!navigator.geolocation){
    showError("Geolocation not supported in this browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const {latitude,longitude} = pos.coords;
      loadData(latitude,longitude);
    },
    () => showError("Unable to retrieve your location.")
  );
});

/* === tab rail === */
tabToday.addEventListener("click",()=>toggleTabs("today"));
tabTomorrow.addEventListener("click",()=>toggleTabs("tomorrow"));

function toggleTabs(which){
  const today = which==="today";
  tabToday.classList.toggle("active",today);
  tabTomorrow.classList.toggle("active",!today);
  detailsToday.classList.toggle("hidden",!today);
  detailsTomorrow.classList.toggle("hidden",today);
}

/* === ajax helpers === */
async function loadData(lat,lng){
  clearError();
  try{
    const todayData    = await fetchDay(lat,lng,"today");
    const tomorrowData = await fetchDay(lat,lng,"tomorrow");
    render(todayData,"today");
    render(tomorrowData,"tomorrow");
    updateCurrent(todayData);
  }catch{ showError("API error – try again."); }
}

async function fetchDay(lat,lng,day){
  const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&date=${day}`;
  const r   = await fetch(url);
  if(!r.ok) throw new Error();
  const j   = await r.json();
  if(j.status!=="OK") throw new Error();
  return j.results;
}

/* === DOM helpers === */
function render(d,tag){
  setVal(`sunrise-${tag}`,      d.sunrise);
  setVal(`sunset-${tag}`,       d.sunset);
  setVal(`dawn-${tag}`,         d.dawn);
  setVal(`dusk-${tag}`,         d.dusk);
  setVal(`solar-noon-${tag}`,   d.solar_noon);
  setVal(`day-length-${tag}`,   d.day_length);
  setVal(`timezone-${tag}`,     d.timezone);
}

function updateCurrent(d){
  sunriseNow.textContent = d.sunrise;
  sunsetNow.textContent  = d.sunset;
  lenNow.textContent     = d.day_length;
  noonNow.textContent    = d.solar_noon;
  dawnNow.textContent    = d.dawn;
  duskNow.textContent    = d.dusk;
  currentDate.textContent = formatDate(new Date(d.date));
  daylightBar.style.width = `${daylightPercent(d.day_length)}%`;
}

function setVal(key,val){
  const el = document.querySelector(`[data-key="${key}"]`);
  if(el) el.textContent = val;
}

/* === utilities === */
const daySecs = s=>s.split(":").reduce((a,v,i)=>a+v* [3600,60,1][i],0);
const daylightPercent = len=> (daySecs(len)/86400*100).toFixed(1);
const formatDate = d=> d.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

function showError(msg){ document.getElementById("error").textContent = msg; }
function clearError(){    document.getElementById("error").textContent = ""; }
