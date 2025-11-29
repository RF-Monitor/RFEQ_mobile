import { timestampNow } from "./time.js";

class StationManager {
    constructor(map){
        this.map = map;
        this.stations = new Map();
        this.Flasher = {
            state: false,
            update(){
				this.state = !this.state
				return this.state;
			}
        };
        
    }

    updateAll(data){
        let seen = new Set();
        let pga_list = data.data;
        let shakealert = data.shake_alert;
        let flash = this.Flasher.update();

        /*----------檢查每個測站----------*/
        for (let data of pga_list){
            // 判斷是否離線
            if (timestampNow(0) - data.timestamp >= 5000) {
                data.pga = 0;
                data.shindo = "0";
                data.isOnline = false;
            }else{
                data.isOnline = true;
            } 

            // 判斷是否是新測站
            if (this.stations.has(data.id)){
                this.stations.get(data.id).update(data, flash, shakealert);
            } else {
                this.stations.set(data.id, new Station(data, shakealert, this.map));
            }
            seen.add(data.id);
        }

        // Remove missing stations
        for (let id of this.stations.keys()){
            if (!seen.has(id)){
                this.stations.get(id).remove();
                this.stations.delete(id);
            }
        }
    }
}
class Station {
    constructor(data, shakealert, map){
        this.id = data.id;
        this.map = map;

        this.shindo_color = {
            "0":"white",
            "1":"white",
            "2":"#0066CC",
            "3":"green",
            "4":"#BAC000",
            "5-":"#FF7F27",
            "5+":"#ED1C24",
            "6-":"red",
            "6+":"#A50021",
            "7":"purple"
        };

        this.setData(data, shakealert);
        this.createGraphics();
    }

    setData(data, shakealert){
        this.id = data.id;
        this.name = data.name;
        this.cname = data.cname;
        this.lat = data.lat;
        this.lon = data.lon;
        this.pga = data.pga;
        this.shindo = data.shindo;
        this.pga_origin = data.pga_origin;
        this.timestamp = data.timestamp;
        this.isOnline = data.isOnline;
        this.shakealert = shakealert;
    }

    createGraphics(){
        let opacity = 1;

        //tooltip
		let toolTip = `<div>${this.name}</div>
            <div>${this.cname}</div>
            <div>PGA(原始): ${this.pga_origin}</div>
            <div>PGA(濾波): ${this.pga}</div>
            <div>震度: ${this.shindo}</div>`

		if(!this.isOnline){
			opacity = 0.3;
			toolTip = `<div>${this.name}</div>
            <div>${this.cname}</div>
            <div>已斷線</div>`
		}

        //icon
        let cusicon = this.getStationIcon();
        
        // marker
        this.marker = L.marker([this.lat, this.lon], {
            title: this.name,
            icon: cusicon
        }).bindTooltip(toolTip)
        .addTo(this.map)
        .setOpacity(opacity);

        // circle
        this.circle = L.circle([this.lat,this.lon], {
            radius: 0,
            color: this.shindo_color[this.shindo],
            fillOpacity: opacity,
			opacity: opacity
        }).addTo(this.map);

    }

    update(data, flash, shakealert){
        this.setData(data, shakealert);
        let opacity = 1;

        //tooltip
		let toolTip = `<div>${this.name}</div>
            <div>${this.cname}</div>
            <div>PGA(原始): ${this.pga_origin}</div>
            <div>PGA(濾波): ${this.pga}</div>
            <div>震度: ${this.shindo}</div>`

		if(!this.isOnline){
			opacity = 0.3;
			toolTip = `<div>${this.name}</div>
            <div>${this.cname}</div>
            <div>已斷線</div>`
		}

        //icon
        let cusicon = this.getStationIcon();

        //marker
        this.marker.setIcon(cusicon);
        this.marker.setLatLng([this.lat, this.lon]);
        this.marker.setTooltipContent(toolTip);
        this.marker.setOpacity(opacity);

        //circle
        let circleRadius = 0;
        if(this.shakealert && shindo != '0' && enable_warningArea !='false' && flash){
			circleRadius = 20000;
		}else{
            circleRadius = 0;
        }
        this.circle.setLatLng([this.lat, this.lon]);
        this.circle.setRadius(circleRadius);
        this.circle.setStyle({ color: this.shindo_color[this.shindo] });
        this.circle.setStyle({opacity: opacity, fillOpacity: opacity});
    }

    remove(){
        this.map.removeLayer(this.marker);
        this.map.removeLayer(this.circle);
    }

    getStationIcon() {
        let iconUrl;
        let size = 10;
        if(!this.isOnline){
            iconUrl = 'img/shindo_icon/disconnected.png';
            size = 7;
        }else{
            if (this.shindo == '0' || !this.shakealert) {
                if (this.pga <= 1) iconUrl = 'img/shindo_icon/pga0.png';
                else if (this.pga <= 1.3) iconUrl = 'img/shindo_icon/pga1.png';
                else if (this.pga <= 1.4) iconUrl = 'img/shindo_icon/pga2.png';
                else iconUrl = 'img/shindo_icon/pga3.png';
            } else {
                iconUrl = 'img/shindo_icon/' + this.shindo + '.png';
                size = 20; // 震度 icon 比較大
            }
        }

        return L.icon({
            iconUrl,
            iconSize: [size, size]
        });
    }
}

export { StationManager }
