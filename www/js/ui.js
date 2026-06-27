import { timestampNow } from "./time.js";

/*----------切頁----------*/
export function initSwitchPage(map, map2){
    const pages = ["page1", "page2", "settingPage"];

    document.querySelectorAll(".navitem").forEach(item => {
        item.addEventListener("click", () => {
            const show = item.dataset.target;

            pages.forEach(p => {
                document.getElementById(p).style.display = (p === show) ? "block" : "none";
            });

            if (show === "page1") {
                setTimeout(() => {
                    map.invalidateSize();
                    map2.invalidateSize();
                }, 100);
            }
        });
    });

    // 預設顯示 page1
    pages.forEach(p => document.getElementById(p).style.display = "none");
    document.getElementById("page1").style.display = "block";
}


/*----------資訊抽屜開合----------*/
const sheet = document.querySelector('.nav_main');
const handle = document.querySelector('.drag_handle');

let startY = 0;
let currentY = 0;
let isDragging = false;

// 點擊 handle 切換開關
handle.addEventListener('click', () => {
    sheet.classList.toggle('open');
});

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

    if (Math.abs(delta) > 120) {
        if (delta > 0) sheet.classList.remove('open');  // 下滑 → 收回
        else sheet.classList.add('open');               // 上滑 → 展開
    }

    sheet.style.transform = ''; // 回歸 class 控制
});

export function login(){
    document.getElementById("login").style.display = "none";
    document.getElementById("user").style.display = "block";
}
export function logout(){
    document.getElementById("login").style.display = "block";
    document.getElementById("user").style.display = "none";
}

class MyRFsensor{
    constructor(sensor){
        this.sensor = sensor;
        this.pageOverlay = document.getElementById("modalOverlay");
        this.page = document.getElementById("RFsensorPage");
        this.submitButton = document.getElementById("submit");
        this.closeButton = document.getElementById("closeModal");

        this.closeButton.addEventListener("click", () => {
            this.hide()
        });

        this.title = document.getElementById("sensorID")
        this.nameInput = document.getElementById("sensorNameInput");
        this.latInput = document.getElementById("sensorLatInput");
        this.lonInput = document.getElementById("sensorLonInput");
    }
    show({ submit } = {}){
        this.pageOverlay.style.display = "flex";
        this.submitButton.addEventListener("click", () => {
            const id = this.sensor.data.id;
            const name = this.nameInput.value;
            const lat = this.latInput.value;
            const lon = this.lonInput.value;
            submit?.({id, name, lat, lon})
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
            const img = document.createElement("img");
            img.src = "img/sensor.png";
            img.style.width = "30%";

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

            sensorDiv.appendChild(img);
            sensorDiv.appendChild(textDiv);

            //點擊後事件
            sensorDiv.addEventListener("click", () => {
                onSelect(sensor);
            })

            this.container.appendChild(sensorDiv);
        });
    }
}

export default {
    initSwitchPage,
    login,
    logout,
    MyRFsensor,
    MyRFsensorList
}