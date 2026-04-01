const defaultSettings = {
    tw_eew: true,
    RFPLUS: true,
    jp_eew: false
};

let subscribers = {}; // { key: [callback] }

export function subscribe(key, callback) {
    if (!subscribers[key]) {
        subscribers[key] = [];
    }
    subscribers[key].push(callback);
}

function notifySubscribers(key, value) {
    if (!subscribers[key]) return;
    subscribers[key].forEach(cb => cb(value));
}

function loadAll() {
    const saved = localStorage.getItem("settings");
    return saved ? JSON.parse(saved) : { ...defaultSettings };
}

export function getSetting(key) {
    const obj = loadAll();
    return obj[key] ?? defaultSettings[key];
}

export function setSetting(key, value) {
    const obj = loadAll();

    if (obj[key] === value) return;

    obj[key] = value;
    localStorage.setItem("settings", JSON.stringify(obj));

    notifySubscribers(key, value);
}

const setting = {
    subscribe,
    get: getSetting,
    set: setSetting
};

export default setting;