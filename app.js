const citySelect=document.getElementById("city");
const cities=[
 {name:"Chicago, IL",lat:41.8781,lng:-87.6298},
 {name:"New York, NY",lat:40.7128,lng:-74.006},
 {name:"Los Angeles, CA",lat:34.0522,lng:-118.2437},
 {name:"London, UK",lat:51.5074,lng:-0.1278},
 {name:"Tokyo, Japan",lat:35.6895,lng:139.6917},
 {name:"Sydney, Australia",lat:-33.8688,lng:151.2093},
 {name:"Paris, France",lat:48.8566,lng:2.3522},
 {name:"Cairo, Egypt",lat:30.0444,lng:31.2357},
 {name:"Rio de Janeiro, Brazil",lat:-22.9068,lng:-43.1729},
 {name:"Cape Town, South Africa",lat:-33.9249,lng:18.4241}
];
cities.forEach(c=>{const o=document.createElement("option");o.value=`${c.lat},${c.lng}`;o.textContent=c.name;citySelect.appendChild(o)});

document.getElementById("getData").addEventListener("click",()=>{
 const parts=citySelect.value.split(",");
 if(parts.length!==2)return;
 loadData(parts[0],parts[1]);
});

async function loadData(lat,lng){
 clearError();
 try{
  const today=await fetchDay(lat,lng,"today");
  const tomorrow=await fetchDay(lat,lng,"tomorrow");
  renderDaylight(today);
  renderDetails(today,"today");
  renderDetails(tomorrow,"tomorrow");
  setDateDisplay();
 }catch{showError("Unable to fetch data. Please try again.");}
}

async function fetchDay(lat,lng,day){
 const url=`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&date=${day}`;
 const r=await fetch(url);
 if(!r.ok)throw new Error();
 const j=await r.json();
 if(j.status!=="OK")throw new Error();
 return j.results;
}

function renderDaylight(d){
 document.getElementById("sunriseDisplay").textContent=d.sunrise;
 document.getElementById("sunsetDisplay").textContent=d.sunset;
 document.getElementById("dayLengthToday").textContent=d.day_length;
 document.getElementById("solarNoonToday").textContent=d.solar_noon;
 document.getElementById("dawnToday").textContent=d.dawn;
 document.getElementById("duskToday").textContent=d.dusk;
 const pct=calcPercent(d.sunrise,d.sunset);
 document.getElementById("progressBar").style.width=`${pct}%`;
}

function renderDetails(d,t){
 setVal(`sunrise-${t}`,d.sunrise);
 setVal(`sunset-${t}`,d.sunset);
 setVal(`dawn-${t}`,d.dawn);
 setVal(`dusk-${t}`,d.dusk);
 setVal(`solar-noon-${t}`,d.solar_noon);
 setVal(`day-length-${t}`,d.day_length);
 setVal(`timezone-${t}`,d.timezone);
}

function setVal(k,v){
 const e=document.getElementById(k);
 if(e)e.textContent=v;
}

function calcPercent(start,end){
 const toSec=s=>{
  const [time,ampm]=s.split(" ");
  let [h,m,p]=time.split(":");p=p||0;
  h=parseInt(h,10);m=parseInt(m,10);p=parseInt(p,10);
  if(ampm==="PM"&&h!==12)h+=12;
  if(ampm==="AM"&&h===12)h=0;
  return h*3600+m*60+p;
 };
 const nowSec=new Date().getHours()*3600+new Date().getMinutes()*60+new Date().getSeconds();
 const startSec=toSec(start);
 const endSec=toSec(end);
 if(nowSec<=startSec)return 0;
 if(nowSec>=endSec)return 100;
 return ((nowSec-startSec)/(endSec-startSec))*100;
}

function setDateDisplay(){
 const opts={weekday:"long",year:"numeric",month:"long",day:"numeric"};
 document.getElementById("displayDate").textContent=new Date().toLocaleDateString(undefined,opts);
}

function showError(m){document.getElementById("error").textContent=m}
function clearError(){document.getElementById("error").textContent=""}

document.getElementById("tabToday").addEventListener("click",()=>{
 switchTab("today");
});
document.getElementById("tabTomorrow").addEventListener("click",()=>{
 switchTab("tomorrow");
});
function switchTab(which){
 document.getElementById("tabToday").classList.toggle("active",which==="today");
 document.getElementById("tabTomorrow").classList.toggle("active",which==="tomorrow");
 document.getElementById("detailsToday").classList.toggle("hidden",which!=="today");
 document.getElementById("detailsTomorrow").classList.toggle("hidden",which!=="tomorrow");
}
