class reportManager{
    constructor(map){
        this.list = [];
        
        this.UI = new reportUI();
        this.map = map;

        this.onClickCallback = null;
        this.mapRenderer = new InfoMapRenderer(map);
    }

    init(){
        fetch("https://rptes.com/report?len=20")
        .then(res => res.json())
        .then(msgs => {
            this.list = [];
            for(const msg of msgs){
                this.list.push(new report(msg))
            }
            this.UI.update(this.list, {
                onClick: (report) => {
                    this.onClickCallback(report)
                }
            });
        })
        .catch(err => {
            console.log(err);
            alert(err);
        })
        
    }

    addReport(msg){
        this.list.push(new report(msg));
        if(this.list.length >= 30){
            this.removeEarliestReport();
        }
        this.UI.update(this.list, {
            onClick: (report) => {
                this.onClickCallback(report)
            }
        });
        
    }

    removeEarliestReport(){
        this.list.shift();
    }

    async getDistribution(id) {
    
        //console.log(id);
        id = id.replace("-", "");
        try {
            const res = await fetch(`https://rptes.com/reportDistribution?id=${encodeURIComponent(id)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const info = await res.json();
            //console.log(info);

            // 只回傳或處理資料，不做任何 UI / 地圖操作
            return info;

        } catch (err) {
            console.error("fetch infoDistribution failed:", err);
            throw err;
        }
    }

    onClick(callback){
        this.onClickCallback = callback;
    }
}

class report{
    constructor(msg){
        this.id = msg.id;
        this.maxShindo = msg.max_shindo;
        this.epicenter = msg.epicenter;
        this.datetime = msg.datetime;
        this.magnitude = msg.magnitude;
        this.depth = msg.depth;
    }
}

class InfoMapRenderer{
    constructor(map){
        this.map = map;
        this.L = L;
        this.distributedLayer = this.L.layerGroup().addTo(this.map);
        this.shindo_icons = {
            "1":L.icon({iconUrl:"../img/shindo_icon/1.png",iconSize:[20,20]}),
            "2":L.icon({iconUrl:"../img/shindo_icon/2.png",iconSize:[20,20]}),
            "3":L.icon({iconUrl:"../img/shindo_icon/3.png",iconSize:[20,20]}),
            "4":L.icon({iconUrl:"../img/shindo_icon/4.png",iconSize:[20,20]}),
            "5-":L.icon({iconUrl:"../img/shindo_icon/5-.png",iconSize:[20,20]}),
            "5+":L.icon({iconUrl:"../img/shindo_icon/5+.png",iconSize:[20,20]}),
            "6-":L.icon({iconUrl:"../img/shindo_icon/6-.png",iconSize:[20,20]}),
            "6+":L.icon({iconUrl:"../img/shindo_icon/6+.png",iconSize:[20,20]}),
            "7":L.icon({iconUrl:"../img/shindo_icon/7.png",iconSize:[20,20]})
        }
    }
    renderDistribution(distribution){
        // 清空舊資料
        this.distributedLayer.clearLayers();

        const info = distribution.info;
        const distributed = distribution.distributed;

        // 震央
        const epicenterLat = info.lat;
        const epicenterLon = info.lon;
        const epicenterName = info.epicenter;

        const epicenterIcon = this.L.icon({
            iconUrl: "../img/shindo_icon/epicenter_tw.png",
            iconSize: [30, 30]
        });

        this.L.marker([epicenterLat, epicenterLon], {
            icon: epicenterIcon,
            title: epicenterName,
            opacity: 1.0
        }).addTo(this.distributedLayer);

        // 震度分布
        for (const s of distributed) {
            const {
                name,
                lat,
                lon,
                shindo,
                pga_sum: pga,
                pgv_sum: pgv
            } = s;

            const shindoIcon = this.shindo_icons[shindo];
            const paneName = `shindo_icon_${shindo}`;

            // 確保 pane 存在（避免重疊層級錯亂）
            if (!this.map.getPane(paneName)) {
                this.map.createPane(paneName);
            }

            const tooltip =
                `<div>${name}</div>` +
                `<div>震度:${shindo}</div>` +
                `<div>PGA:${pga}</div>` +
                `<div>PGV:${pgv}</div>`;

            this.L.marker([lat, lon], {
                icon: shindoIcon,
                title: name,
                opacity: 1.0,
                pane: paneName
            })
            .bindTooltip(tooltip)
            .addTo(this.distributedLayer);
        }

        // 地圖移動
        this.map.panTo([epicenterLat, epicenterLon]);
        this.map.invalidateSize(true);
    }
}

class reportUI{
    constructor(){
        this.dom = document.getElementById("reports")
    }

    update(list, {onClick} = {}){
        this.dom.innerHTML = "";
        for(let report of list){
            let container = document.createElement("div");
            container.id =  report.id;
            container.className = "eew_tile";
            container.innerHTML = `
                <div class="report_content">
                    <div class="report_maxShindo">
                        <!--<h3 align="center" style="margin: 0;">最大震度</h3>-->
                        <img src="img/shindo/${report.maxShindo}.png" style="width:100%;">
                    </div>
                    <div class="report_details">
                        <h2 style="margin-bottom: 0;">${report.epicenter}</h2>
                        <p>${report.datetime}</p>
                    </div>
                    <div class="report_scale">
                        <h2 style="text-align: center;justify-content: center;">${report.magnitude}</h2>
                    </div>          
                </div>
            `
            container.addEventListener("click", () => {
                console.log("click")
                onClick?.(container.id)
            })
            this.dom.appendChild(container);
        }
    }
}

export {reportManager}