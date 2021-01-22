var satellite = 

L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY
});

var streetView =

L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "streets-v11",
  accessToken: API_KEY
});

var grayScale = 

L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "light-v10",
  accessToken: API_KEY
});

var myMap = L.map("map",{
    center: [40.9, -95.4],
    zoom: 4, 
    layers: [satellite, streetView, grayScale]
});

streetView.addTo(myMap);

var earthquake = new L.LayerGroup();

var plates = new L.LayerGroup();

var baseMap = {Satellite: satellite,
"Street View": streetView,
Grayscale: grayScale};

var overlay = {Earthquakes: earthquake,
    "Tectonic Plates": plates};

L.control.layers(baseMap, overlay).addTo(myMap);

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(tetonicData){
    L.geoJson(tetonicData, {
        color: "orange",
        weight: 2,
        opacity: 1
    }).addTo(plates);
    plates.addTo(myMap);
});

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(earthquakeData){
    function styleinfo(feature){
        return {
            radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }
    }
    function getColor(magnitude){
        switch (true){
            case magnitude > 5: 
                return "red";
            case magnitude > 4:
                return "orange";
            case magnitude > 3:
                return "yellow";
            case magnitude > 2:
                return "green";
            case magnitude > 1:
                return "blue";
            default: 
                return "purple";
        }
    }

    function getRadius(magnitude){
        return magnitude * 4;
    }

    L.geoJson(earthquakeData, {
        pointToLayer: function(feature, latlng){
            return L.circleMarker(latlng);
        },
        style: styleinfo,
        onEachFeature: function(feature, layer){
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place)
        }
    }).addTo(earthquake);
    earthquake.addTo(myMap);

    var legend = L.control({position: 'bottomright'});

legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0,1,2,3,4,5]
        colors = ["purple","blue","green","yellow","orange","red"]

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);
})