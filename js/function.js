
//ปรับสีพิ้นหลัง polygon ให้โปร่งใส
kr.on('data:loaded', () => {
  kr.setStyle({
    color: "#2ecc71",
    weight: 4,
    fill: false
  });
}).addTo(map);

const hospitalMarkers = [];

const hospitalIcon = L.icon({
  iconUrl: '../img/pine.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -50]

});

var hospital = new L.GeoJSON.AJAX("../data/hospital.geojson", {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, { icon: hospitalIcon });
  },
  onEachFeature: function (feature, layer) {
    const props = feature.properties;

    // Tooltip แสดงชื่อโรงพยาบาล
    layer.bindTooltip(props.name, {
      direction: 'top',
      offset: [0, -40],
      opacity: 0.8
    });

    // Popup แสดงรายละเอียด + รูป
    const popupContent = `
      <div class='popup-text' style="text-align: center;">
        <b>${props.name}</b>
      </div>
      <div class='popup-text'>
        <b>ที่อยู่: </b> ${props.address}
      </div>
      <div class='popup-text'>
        <b>โทร:</b> ${props.contact_nu}
      </div>
      <div class='popup-text'>
        <b>รายละเอียด:</b> ${props.service_de}<br><br>
      </div>
      <div style="text-align: center;">
        <img class="popup-image" src="../img/${props.image}" width="200px">
      </div>
    `;

    layer.bindPopup(popupContent);

    // เก็บไว้สำหรับหาจุดใกล้สุด
    hospitalMarkers.push(layer);
  }
}).addTo(map);


//-------------------------------------------------------------------------------------------------------------------------------------------
let myLocationMarker;

map.on('click', (e) => {
  const { lat, lng } = e.latlng;

  // ถ้ามี marker เดิมอยู่แล้ว ให้ลบก่อน
  if (myLocationMarker) {
    map.removeLayer(myLocationMarker);
  }

  // สร้าง marker ใหม่
  myLocationMarker = L.marker([lat, lng], {
    icon: L.icon({
      iconUrl: '../img/pin.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -40],
    })
  }).addTo(map).bindPopup("ตำแหน่งของฉัน").openPopup();

  //-------------------------------------------------------------------------------------------------------------------------------------------
  // เรียกฟังก์ชันหาจุดที่ใกล้ที่สุด
  findNearestHospital(lat, lng);
});

let nearestLine = null;

function findNearestHospital(lat, lng) {
  let nearestMarker = null;
  let shortestDistance = Infinity;

  hospitalMarkers.forEach(marker => {
    const markerLatLng = marker.getLatLng();
    const distance = map.distance([lat, lng], markerLatLng); // ระยะทางทางตรง

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestMarker = marker;
    }
  });

  if (nearestMarker) {
    // พิกัดเราและโรงพยาบาล (ORS ใช้ [lng, lat])
    const start = [lng, lat];
    const end = [nearestMarker.getLatLng().lng, nearestMarker.getLatLng().lat];


    // MY API Key = 5b3ce3597851110001cf624879b9bb3661264dc78ba8341263b66d05
    // เรียก ORS API                                                                                                                   <><>
    fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf624879b9bb3661264dc78ba8341263b66d05&start=${start.join(",")}&end=${end.join(",")}`)
      .then(res => res.json())
      .then(data => {
        const coords = data.features[0].geometry.coordinates;
        const latlngs = coords.map(c => [c[1], c[0]]); // แปลง [lng, lat] → [lat, lng] ให้ Leaflet ใช้

        // ลบเส้นเก่าถ้ามี
        if(nearestLine) {
          map.removeLayer(nearestLine)
        };

        // วาดเส้นนำทาง
        nearestLine = L.polyline(latlngs, {
          color: 'red',
          weight: 5
        }).addTo(map);

        //ดึงข้อมูล summary
        const summary = data.features[0].properties.summary;
        const distance = (summary.distance / 1000).toFixed(2); // m → km
        const duration = (summary.duration / 60).toFixed(1); // sec → min

        //ดึงชื่อถนนแรก (optional)
        const firstStreet = data.features[0].properties.segments[0].steps[0]?.name || "ไม่ทราบชื่อถนน";

        //แสดงผลในกล่อง route-info
        document.getElementById("route-info").innerHTML = `
          <b>ข้อมูลเส้นทาง:</b><br>
          📍 ถนน: ${firstStreet}<br>
          📏 ระยะทาง: ${distance} กม.<br>
          ⏱️ เวลาโดยประมาณ: ${duration} นาที
        `;
        nearestMarker.openPopup(); // เปิด popup โรงพยาบาลใกล้ที่สุด
      })
  }
};


//-------------------------------------------------------------------------------------------------------------------------------------------

// search engine
const searchBox = document.querySelector("#search-box");
const searchResults = document.querySelector("#search-results");

searchBox.addEventListener("input", () => {
  const keyword = searchBox.value.toLowerCase();
  searchResults.innerHTML = "";

  if (!keyword) return;

  hospitalMarkers.forEach(marker => {
    const name = marker.feature.properties.name.toLowerCase();

    if (name.includes(keyword)) {
      const item = document.createElement("div");
      item.textContent = marker.feature.properties.name;

      item.addEventListener("click", () => {
        map.setView(marker.getLatLng(), 16);
        marker.openPopup();
        searchResults.innerHTML = "";
        searchBox.value = "";
      });

      searchResults.appendChild(item);
    }
  });
});