let tokenServer = "";
let getVerifyKey = () => null;
let initialized = false;

function setupAndroidNotificationChannels() {
    if (cordova.platformId !== "android") return;

    const channels = [
        {
            id: "eew_alert",
            name: "地震速報",
            description: "臺灣與日本地震速報",
            importance: 4,
            vibration: [0, 500, 150, 500, 150, 1000],
            sound: "default",
            badge: true,
            visibility: 1
        },
        {
            id: "report",
            name: "地震報告",
            description: "地震發生後的詳細報告",
            importance: 3,
            vibration: [0, 250],
            sound: "default",
            badge: true,
            visibility: 1
        },
        {
            id: "pga_alert",
            name: "測站警報",
            description: "測站即時震度與 PGA 警報",
            importance: 4,
            vibration: [0, 250, 100, 250],
            sound: "default",
            badge: true,
            visibility: 1
        }
    ];

    channels.forEach(channel => {
        FirebasePlugin.createChannel(
            channel,
            () => console.log(`Channel created: ${channel.id}`),
            error => console.error(`Channel error (${channel.id}):`, error)
        );
    });
}

function requestNotificationPermission(permissions) {
    permissions.requestPermission(
        permissions.POST_NOTIFICATIONS,
        function (status) {
            if (status.hasPermission) {
                console.log("通知權限已取得");
                setupAndroidNotificationChannels();
            } else {
                console.warn("使用者拒絕通知權限");

                // 👉 可引導去設定頁
                if (cordova.plugins.diagnostic) {
                    cordova.plugins.diagnostic.switchToSettings();
                }
            }
        },
        function (err) {
            console.error("requestPermission error:", err);
        }
    );
}

export function init(server, verifyKeyGetter){
    tokenServer = server;
    getVerifyKey = verifyKeyGetter;

    if(initialized) return;
    initialized = true;

    const permissions = cordova.plugins.permissions;

    // Android 通知權限
    if(cordova.platformId === "android"){
        permissions.checkPermission(
            permissions.POST_NOTIFICATIONS,
            function(status){
                if(status.hasPermission){
                    setupAndroidNotificationChannels();
                }else{
                    requestNotificationPermission(permissions);
                }
            },
            function(err){
                console.error("checkPermission error:", err);
            }
        );
    }

    // 啟動時取得並回報 token
    void reportCurrentToken();

    // Firebase 更新 token 時回報
    FirebasePlugin.onTokenRefresh(function(token){
        void reportTokenToServer(tokenServer, token, getVerifyKey());
    }, function(error){
        console.error("Token refresh error:", error);
    });

    // 回到前景或恢復網路時重新回報
    document.addEventListener("resume", function(){
        void reportCurrentToken();
    }, false);

    document.addEventListener("online", function(){
        void reportCurrentToken();
    }, false);

    FirebasePlugin.onMessageReceived(function(message){
        console.log("Message received:", message);

        if(message.tap){
            console.log("Notification tapped");
        }else{
            // 前景收到通知
            //alert(message.body);
        }
    });
}

function subscribeTopic(topic){
    FirebasePlugin.subscribe(topic,
		function () {
			console.log("Subscribed");
		},
		function (error) {
			console.error("Subscribe error:", error);
		}
	);
}

function unsubscribeTopic(topic){
    FirebasePlugin.unsubscribe(topic,
		function () {
			console.log("Unsubscribed");
		},
		function (error) {
			console.error("Unsubscribe error:", error);
		}
	);
}

async function reportCurrentToken(){
    if(!initialized){
        console.debug("[Firebase] 跳過 token 回報：尚未初始化");
        return false;
    }
    if(!tokenServer){
        console.warn("[Firebase] 跳過 token 回報：未設定伺服器");
        return false;
    }
    if(!getVerifyKey()){
        console.debug("[Firebase] 跳過 token 回報：沒有登入憑證");
        return false;
    }

    try{
        const token = await new Promise((resolve, reject) => {
            FirebasePlugin.getToken(resolve, reject);
        });

        return await reportTokenToServer(tokenServer, token, getVerifyKey());
    }catch(error){
        console.error("Token error:", error);
        return false;
    }
}

async function reportTokenToServer(server, token, verifyKey){
    if(!server || !token || !verifyKey) return false;

    const platform = cordova.platformId;
    if(platform !== "android" && platform !== "ios") return false;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try{
        // 假設後端 router 掛載在 /api/firebase
        const response = await fetch(`https://${server}/api/firebase/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${verifyKey}`
            },
            body: JSON.stringify({
                device_token: token,
                platform: platform
            }),
            signal: controller.signal
        });

        const result = await response.json().catch(() => ({}));

        if(!response.ok || result.success !== true){
            console.warn("Token 回報失敗:", {
                status: response.status,
                message: result.message || result.error || result.content
            });
            return false;
        }

        console.log("Token 回報成功");
        return true;
    }catch(error){
        console.error("Token 回報失敗:",
            error.name === "AbortError" ? "請求逾時" : error.message || error
        );
        return false;
    }finally{
        clearTimeout(timeout);
    }
}

const Firebase = {
    init,
    subscribeTopic,
    unsubscribeTopic,
    reportCurrentToken,
    reportTokenToServer
};

export default Firebase;