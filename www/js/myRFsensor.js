import setting from "./setting.js";

async function getMyRFsensor(server, key){
    const res = await fetch(`https://${server}/api/member/getRegisteredProducts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            key: key
        })
    });

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
}

async function getRFsensorData(server, id = null){
    let url = `https://${server}/api/RFEQ/pga`
    if(id) url = `https://${server}/api/RFEQ/pga?id=${id}`
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.data;

}

async function getRFsensorTriggerList(server, id){
    const url = `https://${server}/api/RFEQ/eventHistory?id=${id}`
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;

}

async function setRFsensor(data, username, loginKey){
    const res = await fetch(`https://rptes.com/api/member/setRFsensorConfig`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...data,
                username,
                loginKey 
            })
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    return true
}

async function setLocalRFsensor(data, ip){
    const res = await fetch(`http://${ip}/get?input_ssid=${data.SSID}&input_password=${data.password}&input_lat=${data.lat}&input_lon=${data.lon}`, {
        method: "GET"
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    return true
}

async function resetRFsensor(id, username, loginKey){
    const res = await fetch(`https://rptes.com/api/member/resetRFsensor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id,
                username,
                loginKey 
            })
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    return true
}

async function downloadRFsensorWaveformImage (server, id, startTime, endTime) {
    const url = `https://${server}/RFEQdatabaseDownload/waveformImage?station=${encodeURIComponent(id)}&start=${startTime}&end=${endTime}`;
    const token = setting.get("loginKey");
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "x-login-key": token? token : ""
        }
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.blob();
}

function downloadToPublicFolder(url, filename, loginKey){
    return new Promise((resolve, reject) => {
        cordova.exec(resolve, reject, "PublicDownload", "download", [
            url,
            filename,
            loginKey || ""
        ]);
    });
}

async function searchLocalStations(){
    const res = await fetch("http://192.168.4.1/monitorData")
    if (!res.ok) {
        return null;
    }
    const data = await res.json();

    if( data.device_id ){
        let dataConverted = {
            id: data.device_id,
            name: "RF-sensor",
            ip: "192.168.4.1",
            data: {
                id: data.device_id,
                name: data.sta_name,
                lat: data.sta_lat,
                lon: data.sta_lon,
                SSID: data.STAssi,
                password: data.STApasswor
            }
        }
        return [
            dataConverted
        ];
    }
    return null;
}

export default {
    getMyRFsensor,
    getRFsensorData,
    getRFsensorTriggerList,
    setRFsensor,
    setLocalRFsensor,
    resetRFsensor,
    downloadRFsensorWaveformImage,
    downloadToPublicFolder,
    searchLocalStations
}