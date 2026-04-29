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

async function getRFsensorStatus(server, id){
    const res = await fetch(`https://${server}/api/RFEQ/pga?id=${id}`)
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data[0];

}

export default {
    getMyRFsensor
}