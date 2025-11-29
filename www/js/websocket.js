import { StationManager } from "./pga.js";

export function ws_connect(map){
	let Station = new StationManager(map);
	let socket = new WebSocket("ws://RFEQSERVER.myqnapcloud.com:8788");//ws://RFEQSERVER.myqnapcloud.com:8788
	socket.onopen = function() {
		
	}
	socket.onmessage = function(event) {
				let data = event.data;
				data = JSON.parse(data);
				//臺灣速報
				if(data["type"] == "eew_tw"){
					console.log(data["content"])
				}
				//日本速報
				if(data["type"] == "eew_jp"){
					eew_jp_ws = data["content"];
				}
				if(data["type"] == "RFPLUS2"){
					console.log("RFPLUS2 recieved")
				}
				if(data["type"] == "RFPLUS3"){
					console.log("RFPLUS3 recieved")
				}
				//地震報告
				if(data["type"] == "report"){
					console.log(data["content"]);
					let report = JSON.stringify(data["content"]);
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
					Station.updateAll(content);
				}
				//海嘯
				if(data["type"] == "tsunami"){
					console.log(data["content"])
					let content = data["content"]
				}
				//要求公鑰 並嘗試登入
				if(data["type"] == "key"){
					
				}
				if(data["type"] == "login"){
					let login_status = data["status"];
					if(login_status == "success"){
						
					}else{
						
					}
				}
	};
	socket.onclose = () => {
		ws_connect();
	}
}