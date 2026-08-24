import { timestampNow, formatTimestamp } from "./time.js";
import myRFsensor from "./myRFsensor.js";
import setting from "./setting.js";

const server_url = "rptes.com";
/*----------切頁----------*/
const onSwitchPageFunc = {}

export function initSwitchPage(){
    const pages = ["page1", "page2", "settingPage"];

    document.querySelectorAll(".navitem").forEach(item => {
        item.addEventListener("click", () => {
            const show = item.dataset.target;
            let pageName = "";
            pages.forEach(p => {
                document.getElementById(p).style.display = (p === show) ? "block" : "none";
                if(p === show){
                    pageName = p;
                }
            });
            onSwitchPageFunc[pageName]?.()
            /*
            if (show === "page1") {
                setTimeout(() => {
                    map.invalidateSize();
                    map2.invalidateSize();
                }, 100);
            }*/
        });
    });

    // 預設顯示 page1
    pages.forEach(p => document.getElementById(p).style.display = "none");
    document.getElementById("page1").style.display = "block";
}

export function onSwitchPage(page, f){
    onSwitchPageFunc[page] = f;
}
export function showReport(){
    document.getElementById("reportPage").style.display = "block";
}
document.getElementById("report_return").addEventListener("click", () => {
    document.getElementById("reportPage").style.display = "none";
})

/*----------資訊抽屜開合----------*/
const sheet = document.querySelector('.nav_main');
const handle = document.querySelector('.drag_area');

let startY = 0;
let currentY = 0;
let isDragging = false;
let currentPosition = "mid";

// 點擊 handle 切換開關
/*
handle.addEventListener('click', () => {
    sheet.classList.toggle('open');
});
*/
// 觸控拖曳開始
handle.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    isDragging = true;
});

// 拖曳中
handle.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    currentY = e.touches[0].clientY;
    let delta = currentY - startY;

    if (!sheet.classList.contains('open')) {
        // 往上拖 → 展開
        delta = Math.max(delta, -300);
        sheet.style.transform = `translateY(${100 + delta}px)`;
    } else {
        // 往下拖 → 收回
        delta = Math.max(delta, -300);
        sheet.style.transform = `translateY(${delta}px)`;
    }
});

// 結束拖曳
handle.addEventListener('touchend', () => {
    isDragging = false;
    let delta = currentY - startY;

    // 滑動距離超過60
    if (Math.abs(delta) > 60) {
        if (delta > 0){// 下滑 → 收回
            if(currentPosition == "mid"){
                sheet.classList.add('close');
                currentPosition = "close";
            }else if(currentPosition == "open"){
                sheet.classList.remove('open');
                currentPosition = "mid";
            }
        } else {// 上滑 → 展開
            if(currentPosition == "mid"){   
                sheet.classList.add('open');
                currentPosition = "open";
            }else if(currentPosition == "close"){
                sheet.classList.remove('close');
                currentPosition = "mid";
            }
                           
        }
    }

    sheet.style.transform = ''; // 回歸 class 控制
});

export function login(username){
    document.getElementById("login").style.display = "none";
    document.getElementById("waiting").style.display = "none";
    document.getElementById("user").style.display = "block";
    document.getElementById("login_user").innerHTML = username;
}
export function loggingin(){
    document.getElementById("login").style.display = "none";
    document.getElementById("waiting").style.display = "block";
    document.getElementById("user").style.display = "none";
}
export function logout(){
    document.getElementById("login").style.display = "block";
    document.getElementById("user").style.display = "none";
    document.getElementById("waiting").style.display = "none";
}

export function startClock(){
    setInterval(() => {
        var myDate = new Date((Date.now()));
        myDate.getYear();        // 獲取當前年份(2位)
        myDate.getFullYear();    // 獲取完整的年份(4位,1970-????)
        myDate.getMonth();       // 獲取當前月份(0-11,0代表1月)
        myDate.getDate();        // 獲取當前日(1-31)
        myDate.getDay();         // 獲取當前星期X(0-6,0代表星期天)
        myDate.getTime();        // 獲取當前時間(從1970.1.1開始的毫秒數)
        myDate.getHours();       // 獲取當前小時數(0-23)
        myDate.getMinutes();     // 獲取當前分鐘數(0-59)
        myDate.getSeconds();     // 獲取當前秒數(0-59)
        myDate.getMilliseconds();    // 獲取當前毫秒數(0-999)
        myDate.toLocaleDateString();     // 獲取當前日期
        var mytime = myDate.toLocaleTimeString();     // 獲取當前時間
        myDate.toLocaleString();        // 獲取日期與時間

        Date.prototype.Format = function (fmt) { // author: meizz
            var o = {
                "M+": this.getMonth() + 1, // 月份
                "d+": this.getDate(), // 日
                "h+": this.getHours(), // 小時
                "m+": this.getMinutes(), // 分
                "s+": this.getSeconds(), // 秒
                "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
                "S": this.getMilliseconds() // 毫秒
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }

        var time2 = new Date().Format("yyyy/MM/dd hh:mm:ss");

        document.getElementById("time_now").innerHTML = time2; 
    }, 1000)
}

export function showServerStatus(status){
    if(status.status == "connecting"){
        document.getElementById("server_status").innerHTML = "連線中...";
        document.getElementById("server_status").style.color = "yellow";
    }
    if(status.status == "connected"){
        document.getElementById("server_status").innerHTML = "已連線";
        document.getElementById("server_status").style.color = "green";
    }

}

export function renderLoginStatus(loginStatus){
    document.getElementById("verified").textContent =
        loginStatus.verified ? "已驗證" : "尚未驗證";

    document.getElementById("accountType").textContent =
        loginStatus.isAdvanced ? "進階帳戶" : "一般帳戶";

    document.getElementById("PLUS").textContent =
        loginStatus.isAdvanced ? "有效" : "未啟用";
}

class MyRFsensor{
    constructor(sensor){
        this.sensor = sensor;
        this.pageOverlay = document.getElementById("modalOverlay");
        this.page = document.getElementById("RFsensorPage");
        this.submitButton = document.getElementById("submit");
        this.resetButton = document.getElementById("reset");
        this.closeButton = document.getElementById("closeModal");

        this.closeButton.addEventListener("click", () => {
            this.hide()
        });

        this.title = document.getElementById("sensorID")
        this.nameInput = document.getElementById("sensorNameInput");
        this.latInput = document.getElementById("sensorLatInput");
        this.lonInput = document.getElementById("sensorLonInput");

        this.triggerListContainer = document.getElementById("sensorTriggerRecords");
        this.triggerEmpty = document.getElementById("sensorTriggerEmpty");
    }
    show({ submit, reset } = {}){
        this.pageOverlay.style.display = "flex";
        this.submitButton.addEventListener("click", () => {
            const id = this.sensor.data.id;
            const name = this.nameInput.value;
            const lat = this.latInput.value;
            const lon = this.lonInput.value;
            submit?.({id, name, lat, lon})
        })
        this.resetButton.addEventListener("click", () => {
            const id = this.sensor.data.id;
            reset?.(id)
        })
    }
    hide(){
        this.pageOverlay.style.display = "none";
    }
    render(){
        this.title.innerText = `${this.sensor.data.id}(${this.sensor.data.cname})`
        this.nameInput.value = this.sensor.data.name;
        this.latInput.value = this.sensor.data.lat;
        this.lonInput.value = this.sensor.data.lon;

        // triggerList
        this.triggerListContainer.innerHTML = "";
        for(const record of this.sensor.triggerList){
            this.triggerEmpty.style.display = "none";

            const tr = document.createElement("tr");

            const tdTime = document.createElement("td");
            tdTime.innerText = formatTimestamp(record.start_time);
            const tdPga = document.createElement("td");
            tdPga.innerText = record.peak_pga;
            const tdShindo = document.createElement("td");
            tdShindo.innerText = record.peak_shindo;
            const tdWaveform = document.createElement("td");

            const downloadButton = document.createElement("button");
            downloadButton.className = "waveform_download_btn";
            downloadButton.innerText = "下載";
            if(record.start_time && record.end_time){
                downloadButton.addEventListener("click", async event => {
                    event.preventDefault();

                    const sensorID = String(this.sensor.data.id).replace(/[\\/:*?"<>|]/g, "_");
                    const timestamp = String(record.start_time).replace(/[\\/:*?"<>|\s]/g, "_");

                    try{
                        const filename = `${sensorID}_${timestamp}_waveform.png`;
                        const url = `https://${server_url}/RFEQdatabaseDownload/waveformImage?station=${encodeURIComponent(this.sensor.data.id)}&start=${encodeURIComponent(record.start_time)}&end=${encodeURIComponent(record.end_time)}`;
                        const token = setting.get("loginKey");

                        if(window.cordova){
                            const savedPath = myRFsensor.downloadToPublicFolder(url, filename, token);
                            alert(`波型圖已下載至 「下載」資料夾，檔名: ${filename}`);
                        }else{
                            const blob = await myRFsensor.downloadRFsensorWaveformImage(server_url, this.sensor.data.id, record.start_time, record.end_time);
                            const objectURL = URL.createObjectURL(blob);
                            const link = document.createElement("a");

                            link.href = objectURL;
                            link.download = filename;
                            document.body.appendChild(link);
                            link.click();
                            link.remove();

                            setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
                        }
                    }catch(error){
                        console.error(error);
                        alert("波型圖下載失敗");
                    }finally{
                        downloadButton.innerText = "下載";
                        downloadButton.disabled = false;
                    }
                });
            }else{
                downloadButton.classList.add("is_disabled");
                downloadButton.removeAttribute("href");
                downloadButton.setAttribute("aria-disabled", "true");
                downloadButton.title = "此紀錄缺少開始或結束時間";
            }

            tdWaveform.appendChild(downloadButton);

            tr.appendChild(tdTime);
            tr.appendChild(tdPga);
            tr.appendChild(tdShindo);
            tr.appendChild(tdWaveform);

            this.triggerListContainer.appendChild(tr);
        }


    }
}

class MyRFsensorList{
    constructor(container){
        this.container = container;
        this.list = [];
    }
    add(sensor){
        this.list.push(sensor)
    }
    render(onSelect = () => {}) {
        this.container.innerHTML = "";

        this.list.forEach(sensor => {
            let status = "";
            if (!sensor.data) {
                status = "🟥尚未登記，請洽RFEQ工作人員處理";
            } else if (timestampNow(0) - sensor.data.timestamp >= 5000) {
                status = `🟥已離線(${sensor.data.cname})`;
            } else {
                status = `🟩在線上(${sensor.data.cname})`;
            }

            // 外層 div
            const sensorDiv = document.createElement("div");
            sensorDiv.id = `RFsensor_${sensor.id}`;
            sensorDiv.className = "sensor";

            // 圖片
            /*
            const img = document.createElement("img");
            img.src = "img/sensor.png";
            img.style.width = "30%";
            */
            // 文字區塊
            const textDiv = document.createElement("div");
            textDiv.className = "sensor_text";

            const h2 = document.createElement("h2");
            h2.textContent = sensor.name;

            const h5_status = document.createElement("h5");
            h5_status.textContent = status;

            const h5_id = document.createElement("h5");
            h5_id.textContent = `ID: ${sensor.id}`;

            // 組裝
            textDiv.appendChild(h2);
            textDiv.appendChild(h5_status);
            textDiv.appendChild(h5_id);

            //sensorDiv.appendChild(img);
            sensorDiv.appendChild(textDiv);

            //點擊後事件
            sensorDiv.addEventListener("click", () => {
                onSelect(sensor);
            })

            this.container.appendChild(sensorDiv);
        });
    }
    renderLoading(){
        this.container.innerHTML = "";

        const sensorDiv = document.createElement("div");
        sensorDiv.className = "sensor";

        const h5_status = document.createElement("h5");
        h5_status.textContent = "載入中，請稍候...";
        sensorDiv.appendChild(h5_status)

        this.container.appendChild(sensorDiv);
    }
    renderEmpty(){
        this.container.innerHTML = "";

        const sensorDiv = document.createElement("div");
        sensorDiv.className = "sensor";

        const h5_status = document.createElement("h5");
        h5_status.textContent = "目前沒有測站";
        sensorDiv.appendChild(h5_status)

        this.container.appendChild(sensorDiv);
    }
    renderNotLoggedIn(){
        this.container.innerHTML = "";

        const sensorDiv = document.createElement("div");
        sensorDiv.className = "sensor";

        const h5_status = document.createElement("h5");
        h5_status.textContent = "登入以查看您擁有的RF-sensor";
        sensorDiv.appendChild(h5_status)

        this.container.appendChild(sensorDiv);
    }
}

export default {
    initSwitchPage,
    onSwitchPage,
    login,
    loggingin,
    logout,
    startClock,
    showServerStatus,
    showReport,
    renderLoginStatus,
    MyRFsensor,
    MyRFsensorList
}