let WetherData = null;
let currentUnit = "celsius";
let currentWindUnit = "kmh";
let currentRainUnit = "mm";


async function getWether(lat, lon, name, country) {

    try {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,wind_speed_10m,relative_humidity_2m,precipitation&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  const data = await res.json();
  WetherData = data;

  const current = data.current;

  document.querySelector("#feels-like").textContent = current.temperature_2m.toFixed(1) + "°C";
  document.querySelector("#humidity").textContent = current.relative_humidity_2m + "%";
  document.querySelector("#wind").textContent = current.wind_speed_10m + " km/h";
  document.querySelector("#precipitation").textContent = current.precipitation + " mm";

  document.querySelector("#city").textContent = `${name}, ${country}`;

  displayWeek(data.daily);
  dayDropdown(data.hourly.time);


   } catch (error) {
      document.querySelector(".container").innerHTML = `
          <div class="error">
      <img src="./assets/images/icon-error.svg" alt="error" width="60" class="error-icon">
      <h1>Oops! Something went wrong</h1>
      <button id="retry-btn">Retry</button>
    </div>
      `
        console.log(console.error() );
        
    }
}

function retryFetch() {
  location.reload(); 
}


document.querySelector("#search-btn").addEventListener("click", async () => {

    const dailyforcast = document.querySelector(".dailyforcast")
    dailyforcast.innerHTML=''
    const cityName = document.querySelector("#city-input").value.trim();
    if (!cityName) return alert("Please enter a city name");
// for city input
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

 if (!geoData.results || geoData.results.length === 0) {
  const container = document.querySelector(".container");
  container.innerHTML = `
    <div class="error">
      <img src="./assets/images/icon-error.svg" alt="error" width="60" class="error-icon">
      <h1>Oops! Something went wrong</h1>
      <button id="retry-btn">Retry</button>
    </div>
  `;

  document.getElementById("retry-btn").addEventListener("click", () => {
    location.reload();
  });

  return;
}

    const { latitude, longitude, name, country } = geoData.results[0];

    getWether(latitude, longitude, name, country);

   
});

document.addEventListener("DOMContentLoaded", () => {
    
    getWether(24.75, 46.625, "Riyadh", "Saudi Arabia");
});


  const icons = {
    0: "/assets/images/icon-sunny.webp",        // Clear
    1: "/assets/images/icon-partly-cloudy.webp",
    2: "/assets/images/icon-partly-cloudy.webp",
    3: "/assets/images/icon-overcast.webp",
    45: "/assets/images/icon-fog.webp",
    48: "/assets/images/icon-fog.webp",
    51: "/assets/images/icon-drizzle.webp",
    61: "/assets/images/icon-rain.webp",
    71: "/assets/images/icon-snow.webp",
    95: "/assets/images/icon-storm.webp"
  };
// function to get day name to use it in dropmenu
function getDayName(s){
const date = new Date(s)
    const options = {weekday:"long"}
    return date.toLocaleDateString("en-US", options)
}

function dayDropdown(time){
    const ulDays = document.querySelector("#days-menu");
    ulDays.innerHTML='';

    const days = [... new Set(time.map(t=>t.split("T")[0]))]

    days.forEach(day => {
        const li = document.createElement("li");
        li.innerHTML=`
        <a class="dropdown-item" href="#"  data-date="${day}" >${getDayName(day)}</a>
        `

        ulDays.appendChild(li)
    });

    ulDays.querySelectorAll(".dropdown-item").forEach(item => {
        item.addEventListener("click",function(e){
e.preventDefault()
const selectedDay = e.target.dataset.date
document.querySelector("#dayDropdown").innerHTML=e.target.textContent
DisplayDayHoures(WetherData.hourly , selectedDay)
        })
    });
}

function DisplayDayHoures(hourly , selectedDay){
    const dayHoures = document.querySelector("#dayHoures");
dayHoures.innerHTML=''

//select 10 houres
     const todayHours = hourly.time
    .map((t, i) => ({
      time: t,
            temp: convertTemp(hourly.temperature_2m[i]),
      code: hourly.weathercode[i],
    }))
    .filter((t) => t.time.startsWith(selectedDay))
    .slice(0, 10);
  const icons = {
    0: "/assets/images/icon-sunny.webp",        // Clear
    1: "/assets/images/icon-partly-cloudy.webp",
    2: "/assets/images/icon-partly-cloudy.webp",
    3: "/assets/images/icon-overcast.webp",
    45: "/assets/images/icon-fog.webp",
    48: "/assets/images/icon-fog.webp",
    51: "/assets/images/icon-drizzle.webp",
    61: "/assets/images/icon-rain.webp",
    71: "/assets/images/icon-snow.webp",
    95: "/assets/images/icon-storm.webp"
  };
    //create div foreach houre


    todayHours.forEach((h,i) => {
        const card = document.createElement("div");
          const wethercode = h.code
        const iconsrc = icons[wethercode] || "/assets/images/icon-sunny.webp";
            card.innerHTML = `
      <div class="d-flex justify-content-between align-items-center" id="card">
    <img src="${iconsrc}" alt="Weather Icon" class="weather-icon mb-2" width=30>
        <span class="fw-semibold">${h.time.split("T")[1]} PM </span>
        <span>${h.temp} ${unitSymbol()}</span>
      </div>
    
    `;
    //icon
    //temp

    dayHoures.appendChild(card);
    });


}

//function display weeek weather

function displayWeek(s){
const dailyforcast = document.querySelector(".dailyforcast")
    s.time.forEach((d,i) => {
        const date = new Date(d)
    const options = {weekday:"short"}
const option = { 
  day: "numeric",        
  month: "short",        
  year: "numeric"        
};   const dayName= date.toLocaleDateString("en-US", options)

const fullDay=date.toLocaleDateString("en-US", option)

    const weatherCode = s.weathercode[i];
    const iconSrc = icons[weatherCode] || "/assets/images/icon-partly-cloudy.webp";

     const maxTemp = Math.round(s.temperature_2m_max[i]);
    const minTemp = Math.round(s.temperature_2m_min[i]);

   const card = document.createElement("div");
    card.classList.add("card", "text-center", "p-2", "shadow-sm");

    card.innerHTML = `
      <div class="card-header  bg-transparent border-0">${dayName}</div>
      <div class="card-body">
        <img src="${iconSrc}" alt="Weather Icon" class="weather-icon mb-2" width="30">
        <h6 class="card-text">${maxTemp}° | ${minTemp}°</h6>
      </div>
    `;

      dailyforcast.appendChild(card);

    //في الكرت الكبير
     document.querySelector(".main-icon").innerHTML=`<img src="${iconSrc}" alt="Weather Icon" class="weather-icon mb-2" width="30">`
    document.querySelector("#day").innerHTML= `${fullDay}`;
    document.querySelector("#dayTemp").innerHTML=`${maxTemp}°`
  ;
    });




}





document.querySelectorAll('.dropdown-item[data-type]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const type = e.target.dataset.type;
    const unit = e.target.dataset.unit;

  document.querySelectorAll(`.dropdown-item[data-type="${type}"] .checkmark`)
      .forEach(span => span.style.display = 'none');

    const checkSpan = e.target.querySelector('.checkmark');
    if (checkSpan) checkSpan.style.display = 'inline';

    document.querySelectorAll(`.dropdown-item[data-type="${type}"]`)
      .forEach(el => el.classList.remove('active-option'));


    item.classList.add('active-option');
    document.getElementById("unitDropdown").textContent = e.target.textContent.replace('✔️','').trim();
   
    if (type === "temperature") {
      currentUnit = unit;
    } else if (type === "wind") {
      currentWindUnit = unit;
    } else if (type === "rain") {
      currentRainUnit = unit;
    }


    document.getElementById("unitDropdown").textContent = e.target.textContent;

    if (!WetherData || !WetherData.current) return;

    const current = WetherData.current;


    document.querySelector("#feels-like").textContent = convertTemp(current.temperature_2m) + unitSymbol();


    document.querySelector("#wind").textContent = convertWind(current.wind_speed_10m) + windUnitSymbol();


    document.querySelector("#precipitation").textContent = convertRain(current.precipitation) + rainUnitSymbol();


    document.querySelector("#humidity").textContent = current.relative_humidity_2m + "%";


    const selectedDay = document.getElementById("dayDropdown").textContent;
    if (selectedDay && selectedDay !== "Select Day") {
      const dayDate = [...new Set(WetherData.hourly.time.map(t => t.split("T")[0]))]
        .find(d => getDayName(d) === selectedDay);
      if (dayDate) DisplayDayHoures(WetherData.hourly, dayDate);
    }


    document.querySelector(".dailyforcast").innerHTML = "";
    displayWeek(WetherData.daily);
  });
});


function convertTemp(celsiusTemp) {
  return currentUnit === "fahrenheit" ? ((celsiusTemp * 9) / 5 + 32).toFixed(1) : celsiusTemp.toFixed(1);
}
function unitSymbol() { return currentUnit === "fahrenheit" ? "°F" : "°C"; }

function convertWind(speedKmh) {
  return currentWindUnit === "mph" ? (speedKmh / 1.609).toFixed(1) : speedKmh.toFixed(1);
}
function windUnitSymbol() { return currentWindUnit === "mph" ? "mph" : "km/h"; }

function convertRain(mm) {
  return currentRainUnit === "inch" ? (mm / 25.4).toFixed(2) : mm.toFixed(1);
}
function rainUnitSymbol() { return currentRainUnit === "inch" ? "in" : "mm"; }

