const citySelect=document.getElementById("city")
const sunriseNow=document.getElementById("sunriseNow")
const sunsetNow=document.getElementById("sunsetNow")
const lenNow=document.getElementById("lenNow")
const noonNow=document.getElementById("noonNow")
const dawnNow=document.getElementById("dawnNow")
const duskNow=document.getElementById("duskNow")
const currentDate=document.getElementById("currentDate")
const daylightBar=document.getElementById("daylightBar")
const tabToday=document.getElementById("tabToday")
const tabTomorrow=document.getElementById("tabTomorrow")
const detailsToday=document.getElementById("detailsToday")
const detailsTomorrow=document.getElementById("detailsTomorrow")

const cities=[
  {name:"Chicago, IL",lat:41.8781,lng:-87.6298},
  {name:"New York, NY",lat:40.7128,lng:-74.0060},
  {name:"Los Angeles, CA",lat:34.0522,lng:-118.2437},
  {name:"London, UK",lat:51.5074,lng:-0.1278},
  {name:"Tokyo, Japan",lat:35.6895,lng:139.6917},
  {name:"Sydney, Australia",lat:-33.8688,lng:151.2093},
  {name:"Paris, France",lat:48.8566,lng:2.3522},
  {name:"Cairo, Egypt",lat:30.0444,lng:31.2357},
  {name:"Rio de Janeiro, Brazil",lat:-22.9068,lng:-43.1729},
  {name:"Cape Town, South Africa",lat:-33.9249,lng:18.4241}
]

cities.forEach(c=>{const o=document.createElement("option");o.value=`${c.lat},${c.lng}`;o.textContent=c.name;citySelect.appendChild(o)})

document.getElementById("getData").addEventListener("click",()=>{
  const parts=citySelect.value.split(",")
  if(parts.length!==2)return
  loadData(parts[0],parts[1])
})

tabToday.addEventListener("click",()=>toggleTabs("today"))
tabTomorrow.addEventListener("click",()=>toggleTabs("tomorrow"))

function toggleTabs(sel){
  if(sel==="today"){
    tabToday.classList.add("active")
    tabTomorrow.classList.remove("active")
    detailsToday.classList.remove("hidden")
    detailsTomorrow.classList.add("hidden")
  }else{
    tabTomorrow.classList.add("active")
    tabToday.classList.remove("active")
    detailsTomorrow.classList.remove("hidden")
    detailsToday.classList.add("hidden")
  }
}

async function loadData(lat,lng){
  clearError()
  const todayData=await fetchDay(lat,lng,"today")
  const tomorrowData=await fetchDay(lat,lng,"tomorrow")
  render(todayData,"today")
  render(tomorrowData,"tomorrow")
  updateCurrent(todayData)
}

async function fetchDay(lat,lng,day){
  const url=`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&date=${day}`
  const r=await fetch(url)
  if(!r.ok)throw new Error()
  const j=await r.json()
  if(j.status!=="OK")throw new Error()
  return j.results
}

function render(d,t){
  setVal(`sunrise-${t}`,d.sunrise)
  setVal(`sunset-${t}`,d.sunset)
  setVal(`dawn-${t}`,d.dawn)
  setVal(`dusk-${t}`,d.dusk)
  setVal(`solar-noon-${t}`,d.solar_noon)
  setVal(`day-length-${t}`,d.day_length)
  setVal(`timezone-${t}`,d.timezone)
}

function updateCurrent(d){
  sunriseNow.textContent=d.sunrise
  sunsetNow.textContent=d.sunset
  lenNow.textContent=d.day_length
  noonNow.textContent=d.solar_noon
  dawnNow.textContent=d.dawn
  duskNow.textContent=d.dusk
  currentDate.textContent=formatDate(new Date(d.date))
  daylightBar.style.width=`${daylightPercent(d.day_length)}%`
}

function daylengthToSeconds(s){
  const p=s.split(":").map(Number)
  return p[0]*3600+p[1]*60+p[2]
}

function daylightPercent(len){
  return (daylengthToSeconds(len)/86400*100).toFixed(1)
}

function formatDate(d){
  return d.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})
}

function setVal(k,v){
  const e=document.querySelector(`[data-key="${k}"]`)
  if(e)e.textContent=v
}

function showError(m){
  document.getElementById("error").textContent=m
}

function clearError(){
  document.getElementById("error").textContent=""
}
