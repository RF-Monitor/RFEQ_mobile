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

async function getRFsensorData(server, id){
    const res = await fetch(`https://${server}/api/RFEQ/pga?id=${id}`)
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.data[0];

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
export default {
    getMyRFsensor,
    getRFsensorData,
    setRFsensor
}