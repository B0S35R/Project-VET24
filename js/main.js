
var map = L.map("map").setView([14.959, 102.053], 11); //สร้างแผนที่

var CartoDB_PositronNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20
});

var Stadia_AlidadeSatellite = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}", {
  minZoom: 0,
  maxZoom: 20,
  attribution:
    '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  ext: "jpg"
});

var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
  minZoom: 0,
  maxZoom: 20,
  attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  ext: 'png'
});


// Group Basemap ยังไม่ใช่เครื่องมือที่ขึ้นมาให้ใช้
var baseMaps = {
  "Light": CartoDB_PositronNoLabels.addTo(map),
  "Dark": Stadia_AlidadeSmoothDark,
  "Satellite": Stadia_AlidadeSatellite,
};


var kr = new L.GeoJSON.AJAX("../data/korat.geojson");


// add Layer control สร้างหน้าต่างเครื่องมือ
var layerControl = L.control.layers(baseMaps).addTo(map);


// add scale ซ้ายล่าง(Default)
var scale = L.control.scale().addTo(map);
scale.setPosition('bottomleft');

// minimap
var osm2 = new L.TileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  minZoom: 0,
  maxZoom: 13,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var minimap = new L.Control.MiniMap(osm2, { toggleDisplay: true }).addTo(map);



map.on('baselayerchange', function (e) {
  const title = document.querySelector("#map-title");
  const selected = e.name.toLowerCase();

  if (selected.includes("dark") || selected.includes("satellite")) {
    title.style.color = "white";
    title.style.textShadow = "1px 1px 2px black"; // เพิ่มเงาสีดำให้อ่านง่าย
  } else {
    title.style.color = "black";
    title.style.textShadow = "1px 1px 2px white"; // คืนค่าเดิม
  }
});