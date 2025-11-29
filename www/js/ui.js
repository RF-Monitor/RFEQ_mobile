/*----------切頁----------*/
const pages = ["page1", "page2", "settingPage"];

document.querySelectorAll(".navitem").forEach(item => {
    item.addEventListener("click", () => {
        const show = item.dataset.target;

        pages.forEach(p => {
            document.getElementById(p).style.display = (p === show) ? "block" : "none";
        });
    });
});

// 預設顯示 page1
pages.forEach(p => document.getElementById(p).style.display = "none");
document.getElementById("page1").style.display = "block";

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