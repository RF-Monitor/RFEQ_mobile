import { EEWTWManager } from "./EEW_TW.js";
import { ws_connect } from "./websocket.js";
import { locations } from "./locations.js";

// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
let map = null;
let country_geojson = {}
var countylines = {}
var town_line = {};
var town_ID_list = []

function mapInit(map){
    map = L.map('mapid').setView([23.7, 120.924610], 8);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', { 
        minZoom: 3, 
        maxZoom: 16 }
    ).addTo(map);

    //----------geoJson----------//
    
    $.ajaxSettings.async = false;
    //縣市界
    countylines = {}
    $.getJSON("geojson/taiwan_ADB.geojson", function (r) {
		countylines = r
	});
    console.log(countylines)
    //鄉鎮市區界
	
	$.getJSON("geojson/TOWN_MOI.geojson", function (r) {
		country_geojson = r;
		for (let i = 0; i < r["features"].length; i++) {
			town_line[r["features"][i]["properties"]["TOWNCODE"]] = r["features"][i]
		}
	});

    //縣市列表
    let country_list = ["基隆市", "臺北市", "新北市", "桃園市", "新竹縣", "新竹市", "苗栗縣", "臺中市", "彰化縣", "雲林縣", "嘉義縣", "嘉義市", "臺南市", "高雄市", "屏東縣", "臺東縣", "花蓮縣", "宜蘭縣", "澎湖縣", "金門縣", "連江縣", "南投縣"];

    //縣市界(獨立)
	let country_count = 0
	var geojson_list = {};


	for (let i = 0; i < country_list.length; i++) {
		country_count = i
		$.getJSON("geojson/countries/" + country_list[i] + ".json", function (r) {
			geojson_list[country_list[country_count]] = r;
		});
	};

    //town_ID
    
	$.getJSON("json/Town_ID.json", function (r) {
		town_ID_list = r;
	})


    //----------panes----------//
	map.createPane("RFPLUS_shindo_list_layer");
	map.createPane('eew_RF_shindo_list_layer');
	map.createPane('eew_tw_shindo_list_layer');
	map.createPane('countyline');
	//map.createPane('weather_warning_layers');
	//map.createPane('typhoon_layer');
	map.createPane('wave_layer');
	map.createPane('shindo_icon_disconnected');
	map.createPane('shindo_icon_0');
	map.createPane('shindo_icon_0_0');
	map.createPane('shindo_icon_0_1');
	map.createPane('shindo_icon_0_2');
	map.createPane('shindo_icon_0_3');
	map.createPane('shindo_icon_1');
	map.createPane('shindo_icon_2');
	map.createPane('shindo_icon_3');
	map.createPane('shindo_icon_4');
	map.createPane('shindo_icon_5-');
	map.createPane('shindo_icon_5+');
	map.createPane('shindo_icon_6-');
	map.createPane('shindo_icon_6+');
	map.createPane('shindo_icon_7');
	
	map.getPane("eew_RF_shindo_list_layer").style.zIndex = 300;
	map.getPane("RFPLUS_shindo_list_layer").style.zIndex = 310;
	map.getPane('eew_tw_shindo_list_layer').style.zIndex = 410;
	map.getPane('countyline').style.zIndex = 420;
	map.getPane('wave_layer').style.zIndex = 450;
	map.getPane('shindo_icon_0').style.zIndex = 601;
	map.getPane('shindo_icon_disconnected').style.zIndex = 600;
	map.getPane('shindo_icon_0_0').style.zIndex = 601;
	map.getPane('shindo_icon_0_1').style.zIndex = 602;
	map.getPane('shindo_icon_0_2').style.zIndex = 603;
	map.getPane('shindo_icon_0_3').style.zIndex = 604;
	map.getPane('shindo_icon_1').style.zIndex = 605;
	map.getPane('shindo_icon_2').style.zIndex = 610;
	map.getPane('shindo_icon_3').style.zIndex = 615;
	map.getPane('shindo_icon_4').style.zIndex = 620;
	map.getPane('shindo_icon_5-').style.zIndex = 625;
	map.getPane('shindo_icon_5+').style.zIndex = 630;
	map.getPane('shindo_icon_6-').style.zIndex = 635;
	map.getPane('shindo_icon_6+').style.zIndex = 640;
	map.getPane('shindo_icon_7').style.zIndex = 645;
	map.getPane('wave_layer').style.zIndex = 450;
	

    //----------layerGroups----------//
	L.layerGroup([L.geoJSON(countylines, { color: "#D0D0D0", weight: 1 ,pane:"countyline"})]).addTo(map);
	//countyline2 = L.layerGroup([L.geoJSON(r, { color: "#D0D0D0", weight: 1 })]).addTo(map2);
	//countyline3 = L.layerGroup([L.geoJSON(r, { color: "#D0D0D0", weight: 1 })]).addTo(map3);

    return map;
}

function onDeviceReady(){
    let alert = {
            "type": "eew-cwa",
            "time": 1764496725000,
            "center": {
                "lon": 121.021,
                "lat": 24.818,
                "depth": 10,
                "cname": "新竹縣竹北市",
            },
            "scale": 5,
            "report_num": 1,
            "id": "1120405",
            "cancel": false,
            "max": 5,
            "alert":true
        }
    map = mapInit();
	ws_connect(map);
    let EEW = new EEWTWManager(map,locations,town_ID_list,town_line,L);
    EEW.handleAlert(24.8,121.0,alert);
    setInterval(() => EEW.tick(),100);

}

if (window.cordova) {
    document.addEventListener("deviceready", onDeviceReady);
} else {
    console.log("Running in browser");
    onDeviceReady();  // 讓 UI 在瀏覽器也能測試
}




