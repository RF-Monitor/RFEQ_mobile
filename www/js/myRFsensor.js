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

async function downloadRFsensorWaveformImage (url, filename, loginKey) {
    return new Promise((resolve, reject) => {
        cordova.exec(resolve, reject, "PublicDownload", "download", [
            url,
            filename,
            loginKey || ""
        ]);
    });
}

export default {
    getMyRFsensor,
    getRFsensorData,
    getRFsensorTriggerList,
    setRFsensor,
    resetRFsensor,
    downloadRFsensorWaveformImage
}