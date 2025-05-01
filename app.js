/* app.js – Sunrise & Sunset Dashboard */

const citySelect  = document.getElementById("city");
const geoBtn      = document.getElementById("geoBtn");
const getDataBtn  = document.getElementById("getData");

/* current-day widgets */
const sunriseNow  = document.getElementById("sunriseNow");
const sunsetNow   = document.getElementById("sunsetNow");
const lenNow      = document.getElementById("lenNow");
const noonNow     = document.getElementById("noonNow");
const dawnNow     = document.getElementById("dawnNow");
const duskNow     = document.getElementById("duskNow");
const currentDate = document.getElementById("currentDate");
const daylightBar = document.getElementById("daylightBar");

/* tabs */
const tabToday    = document.getElementById("tabToday");
const tabTomorrow = document.getElementById("tabTomorrow");
const detailsToday    = document.getElementById("detailsToday");
const detailsTomorrow = document.getElementById("detailsTomorrow");

/* 10 preset cities */
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

/* fill the dropdown */
cities.forEach(c=>{
  const opt = document.createElement("option");
  opt.value = `${c.lat},${c.lng}`;
  opt.textContent = c.name;
  citySelect.appendChild(opt);
});

/* fetch by selected city */
getDataBtn.addEventListener("click",()=>{
  const [lat,lng] = citySelect.value.split(",");
  if(lat && lng) loadData(lat,lng);
});

/* fetch by browser location */
geoBtn.addEventListener("click",()=>{
  if(!navigator.geolocation){
    showError("Geolocation not supported.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos=>{
      const {latitude,longitude} = pos.coords;
      setLocationOption(latitude,longitude);
      loadData(latitude,longitude);
    },
    ()=>showError("Unable to get location.")
  );
});

/* add or update “My Location” option */
function setLocationOption(lat,lng){
  let opt = document.getElementById("current-location-option");
  if(!opt){
    opt = document.createElement("option");
    opt.id = "current-location-option";
    citySelect.prepend(opt);
  }
  opt.value = `${lat},${lng}`;
  opt.textContent = `My Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
  citySelect.value = opt.value;
}

/* tab click */
tabToday.addEventListener("click",()=>swapTabs(true));
tabTomorrow.addEventListener("click",()=>swapTabs(false));

function swapTabs(showToday){
  tabToday.classList.toggle("active",  showToday);
  tabTomorrow.classList.toggle("active",!showToday);
  detailsToday.classList.toggle("hidden", !showToday);
  detailsTomorrow.classList.toggle("hidden", showToday);
}

/* main loader */
async function loadData(lat,lng){
  clearError();
  try{
    const today    = await fetchDay(lat,lng,"today");
    const tomorrow = await fetchDay(lat,lng,"tomorrow");
    render(today,"today");
    render(tomorrow,"tomorrow");
    updateNow(today);
  }catch{ showError("API error."); }
}

async function fetchDay(lat,lng,when){
  const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&date=${when}`;
  const r   = await fetch(url);
  if(!r.ok) throw new Error();
  const j = await r.json();
  if(j.status!=="OK") throw new Error();
  return j.results;
}

/* update both panels */
function render(d,tag){
  set(`sunrise-${tag}`,    d.sunrise);
  set(`sunset-${tag}`,     d.sunset);
  set(`dawn-${tag}`,       d.dawn);
  set(`dusk-${tag}`,       d.dusk);
  set(`solar-noon-${tag}`, d.solar_noon);
  set(`day-length-${tag}`, d.day_length);
  set(`timezone-${tag}`,   d.timezone);
}

/* update top summary card */
function updateNow(d){
  sunriseNow.textContent = d.sunrise;
  sunsetNow.textContent  = d.sunset;
  lenNow.textContent     = d.day_length;
  noonNow.textContent    = d.solar_noon;
  dawnNow.textContent    = d.dawn;
  duskNow.textContent    = d.dusk;
  currentDate.textContent = formatDate(new Date(d.date));
  daylightBar.style.width = `${dayPct(d.day_length)}%`;
}

/* small helpers */
function set(key,val){
  const el = document.querySelector(`[data-key="${key}"]`);
  if(el) el.textContent = val;
}

const secs  = s=>s.split(":").reduce((a,v,i)=>a+v* [3600,60,1][i],0);
const dayPct= len=> (secs(len)/86400*100).toFixed(1);
const formatDate = d=> d.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

function showError(m){ document.getElementById("error").textContent = m; }
function clearError(){ document.getElementById("error").textContent = ""; }
