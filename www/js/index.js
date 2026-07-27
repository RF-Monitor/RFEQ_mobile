import { EEWTWManager } from "./EEW_TW.js";
import websocketManager from "./websocket.js";
import { locations } from "./locations.js";
import { reportManager } from "./reports.js";
import { StationManager } from "./pga.js";
import firebase from "./firebase.js"
import setting from "./setting.js";
import auth from "./auth.js";
import myRFsensorHandler from "./myRFsensor.js";
import ui from "./ui.js";

const server_url = "rptes.com";

// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
let map = null;
let map2 = null;
let country_geojson = {}
//var countylines = {}
var town_line = {};
var town_ID_list = []
var countyLine = {};

async function loadCountyLines() {
    try {
        const res = await fetch("geojson/taiwan_ADB.geojson");
        return await res.json();
    } catch (err) {
        console.error(err);
    }
}
async function loadCityLines() {
    try {
        const res = await fetch("geojson/TOWN_MOI.geojson");
        const data = await res.json();

        const town_line = {};

        for (let i = 0; i < data.features.length; i++) {
            const feature = data.features[i];
            const code = feature.properties.TOWNCODE;
            town_line[code] = feature;
        }

        return town_line;

    } catch (err) {
        console.error(err);
        return null;
    }
}
async function loadCountyGeoJson() {
    const country_list = [
        "基隆市","臺北市","新北市","桃園市","新竹縣","新竹市",
        "苗栗縣","臺中市","彰化縣","雲林縣","嘉義縣","嘉義市",
        "臺南市","高雄市","屏東縣","臺東縣","花蓮縣","宜蘭縣",
        "澎湖縣","金門縣","連江縣","南投縣"
    ];

    const geojson_list = {};

    try {
        await Promise.all(
            country_list.map(async (name) => {
                const res = await fetch(`geojson/countries/${name}.json`);
                const data = await res.json();
                geojson_list[name] = data;
            })
        );

        return geojson_list;

    } catch (err) {
        console.error("載入縣市 geojson 失敗:", err);
        return null;
    }
}
async function loadTownId() {
    try {
        const res = await fetch("json/Town_ID.json");
        return await res.json();
    } catch (err) {
        console.error(err);
    }
}

async function mapInit(mapid){
    const map = L.map(mapid, {zoomSnap: 0.25, zoomDelta: 0.25, zoomControl:false}).setView([22.7, 120.924610], 7.5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', { 
        minZoom: 3, 
        maxZoom: 16 }
    ).addTo(map);

    //----------geoJson----------//
    //縣市界
    const countylines = await loadCountyLines();
    console.log(countylines)

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

function settingsInit(){
	/*----------設定頁面----------*/
	document.getElementById("tw_eew").checked = setting.get("tw_eew");
	document.getElementById("RFPLUS").checked = setting.get("RFPLUS");
	document.getElementById("jp_eew").checked = setting.get("jp_eew");
	document.getElementById("report").checked = setting.get("report");
	document.getElementById("pga").checked = setting.get("pga");

	document.getElementById("tw_eew").addEventListener("change",(e) => {
    	setting.set("tw_eew", e.target.checked);
	})

	document.getElementById("RFPLUS").addEventListener("change",(e) => {
    	setting.set("RFPLUS", e.target.checked);
	})

	document.getElementById("jp_eew").addEventListener("change",(e) => {
    	setting.set("jp_eew", e.target.checked);
	})
	document.getElementById("report").addEventListener("change",(e) => {
    	setting.set("report", e.target.checked);
	})
	document.getElementById("pga").addEventListener("change",(e) => {
    	setting.set("pga", e.target.checked);
	})
	document.getElementById("login_btn").addEventListener("click",async () => {
		document.getElementById("login_btn").innerText = "登入中...";
		document.getElementById("login_btn").disabled = true;
		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;
		const result = await auth.login(email, password, server_url);
		if(result.success){
			setting.set("loginUser", email);
			setting.set("loginKey", result.loginKey);
			const result2 = await websocketManager.login(result.loginKey);
			ui.login(result2.user);
		}else{
			alert("登入失敗!請檢查帳號密碼是否正確");
			ui.logout();
		}
		document.getElementById("login_btn").disabled = false;
		document.getElementById("login_btn").innerText = "登入";
	})
	document.getElementById("logout_btn").addEventListener("click",async () => {
		setting.set("loginUser", "");
		setting.set("loginKey", "");
		ui.logout();
		alert("登出成功");
	})
}

async function onDeviceReady(){
	//測試用警報
    let alert = {
            "type": "eew-cwa",
            "time": Date.now(),
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
	settingsInit();

	/*----------firebase----------*/
	
	firebase.init();
	
	if(setting.get("tw_eew")){
		firebase.subscribeTopic("tw_eew")
	}
	
	if(setting.get("jp_eew")){
		firebase.subscribeTopic("jp_eew")
	}
	if(setting.get("report")){
		firebase.subscribeTopic("report")
	}
	if(setting.get("pga")){
		firebase.subscribeTopic("pga")
	}

	//監聽設定
	setting.subscribe("tw_eew", (c) => {
		if(c) firebase.subscribeTopic("tw_eew");
		else firebase.unsubscribeTopic("tw_eew");
	})
	
	setting.subscribe("jp_eew", (c) => {
		if(c) firebase.subscribeTopic("jp_eew");
		else firebase.unsubscribeTopic("jp_eew");
	})
	setting.subscribe("report", (c) => {
		if(c) firebase.subscribeTopic("report");
		else firebase.unsubscribeTopic("report");
	})
	setting.subscribe("pga", (c) => {
		if(c) firebase.subscribeTopic("pga");
		else firebase.unsubscribeTopic("pga");
	})
	
	/*----------地圖相關----------*/
	//地理資料
	town_ID_list = await loadTownId();
	town_line = await loadCityLines();
	countyLine = await loadCountyGeoJson();

	//map
    map = await mapInit("mapid");
	map2 = await mapInit("map_report")

	ui.initSwitchPage(map, map2)

	ui.startClock()

	/*----------主要功能處理----------*/
    let EEW = new EEWTWManager(map,locations,town_ID_list,town_line,L);
	setInterval(() => {
		EEW.tick(Date.now())
	},100);

	let report = new reportManager(map2);
	report.onClick(async (id) => {
		ui.showReport();
		const distribution =  await report.getDistribution(id)
		report.UI.showReport(distribution)
		report.mapRenderer.renderDistribution(distribution);
	})
	report.init();

	let Station = new StationManager(map);

	const myRFsensorList = new ui.MyRFsensorList(document.getElementById("RFsensorList"))
	myRFsensorList.renderLoading();

	/*----------websocket連線----------*/
	ui.loggingin();
	websocketManager.ws_init(EEW,report,Station);
	websocketManager.onStatus((status) =>{
		ui.showServerStatus(status);
	})
	await websocketManager.ws_connect();
	if(setting.get("loginKey")){
		const result = await websocketManager.login(setting.get("loginKey"));
		if(result.status == "success"){
			ui.login(result.user);
		}else{
			ui.logout();
		}
	}else{
		ui.logout();
	}
	
	/*----------myRFsensor----------*/
	
	const onSensorSelect = (sensor) => {
		const myRFsensor = new ui.MyRFsensor(sensor);
		myRFsensor.show({
			submit:async (data) => {
				// 套用測站設定
				if(await myRFsensorHandler.setRFsensor(data, setting.get("loginUser"), setting.get("loginKey"))){
					window.alert("設定成功");
				}
			},
			reset:async(id) => {
				if(await myRFsensorHandler.resetRFsensor(id, setting.get("loginUser"), setting.get("loginKey"))){
					window.alert("已發出重設指令");
				}
			}
		});
		myRFsensor.render();
	}
	if(setting.get("loginKey")){
		try{
			const RFsensorList = await myRFsensorHandler.getMyRFsensor(server_url, setting.get("loginKey"));
			const data = await websocketManager.getLatestPGA();
			await Promise.all(
				RFsensorList.map(async (sensor) => {
					const id = sensor.id;
					sensor.data = data.data.find((station) => {
						return station.id == id
					});
					myRFsensorList.add(sensor);
				})
			);

			myRFsensorList.render(onSensorSelect);
		}catch(err){
			console.error(err);
		}
	}else{
		myRFsensorList.renderNotLoggedIn();
	}

    /*EEW.handleAlert(24.8,121.0,alert);*/

}

if (window.cordova) {
    document.addEventListener("deviceready", onDeviceReady);
} else {
    console.log("Running in browser");
    onDeviceReady();  // 讓 UI 在瀏覽器也能測試
}




