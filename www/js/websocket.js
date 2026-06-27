
//import { reportManager } from "./reports.js";
//import { EEWTWManager } from "./EEW_TW.js";
let EEWManager = null
let reportManager = null;
let stationManager = null;
let socket = null
let loginResolver = null;

function ws_init(EEW,report,station){
	EEWManager = EEW;
	reportManager = report;
	stationManager = station;
}

export function ws_connect(){
	return new Promise((resolve, reject) => {
		
		socket = new WebSocket("wss://rptes.com:443/ws/");//ws://RFEQSERVER.myqnapcloud.com:8788
		
		socket.onopen = function() {
			//  test data
			/*
			EEWManager.handleAlert(24.8,121.0,{"id":"1749301625",
                        "type":"RFPLUS3",
                        "time": Date.now(),
                        "center":{
                            "lat":24.818,//float
                            "lon":121.02,///float
                            "cname":"新竹縣竹北市",//float
                            "depth":10
                        },
                        "scale":5.123456789,
                        "rate":0,
                        "report_num":1,
                        "final":false});
			*/
			resolve(socket); // 這裡才代表「真的連上」
		}
		
		socket.onerror = function(err) {
			reject(err);
		}
		
		socket.onmessage = function(event) {
			let data = event.data;
			data = JSON.parse(data);
			
			//臺灣速報
			if(data["type"] == "eew_tw"){
				console.log(data["content"])
				EEWManager.handleAlert(24.8,121.0,data["content"]);
			}
			
			/*
			//日本速報
			if(data["type"] == "eew_jp"){
				eew_jp_ws = data["content"];
			}
			
			if(data["type"] == "RFPLUS2"){
				console.log("RFPLUS2 recieved")
			}
			*/
			
			if(data["type"] == "RFPLUS3"){
				console.log("RFPLUS3 recieved")
			}
			
			//地震報告
			if(data["type"] == "report"){
				console.log(data["content"]);
				let report = data["content"];
				reportManager.addReport(report[0]);
			}
			
			//天氣警特報
			if(data["type"] == "weather"){
				console.log(data["content"])
				let weather_ws = JSON.stringify(data["content"])
			}
			
			//測站
			if(data["type"] == "pga"){
				console.log(data["content"])
				let content = data["content"]
				stationManager.updateAll(content);
			}
			
			//海嘯
			if(data["type"] == "tsunami"){
				console.log(data["content"])
				let content = data["content"]
			}
			
			if(data["type"] == "login"){
				loginResolver(data);
			}
		};
		
		socket.onclose = () => {
			setTimeout(() => {
				ws_connect();
			}, 3000);
		};
		
	});
}

export function login(verifyKey){
	return new Promise((resolve, reject) => {
		loginResolver = resolve;

		socket.send(JSON.stringify({
			request: 'verify_noPublicKey',
			key: verifyKey
		}));
	});
}

const WebsocketManager = {
    ws_init,
    ws_connect,
	login
};

export default WebsocketManager;