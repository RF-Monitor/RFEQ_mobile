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

export function init(){
    const permissions = cordova.plugins.permissions;

    // Android 13+ 通知權限
    if (cordova.platformId === "android") {
        permissions.checkPermission(
            permissions.POST_NOTIFICATIONS,
            function (status) {
                if (status.hasPermission) {
                    //setupFCM();
                    setupAndroidNotificationChannels();
                } else {
                    requestNotificationPermission(permissions);
                }
            },
            function (err) {
                console.error("checkPermission error:", err);
            }
        );
    }
    
    //get token
    FirebasePlugin.getToken(function (token) {
        console.log("FCM Token:", token);

        // 若仍使用 token 架構，可上傳到 server
        // uploadTokenToServer(token);

    }, function (error) {
        console.error("Token error:", error);
    });

    //subscribe topic
    /*
    FirebasePlugin.subscribe("eew_tw",
		function () {
			console.log("Subscribed");
		},
		function (error) {
			console.error("Subscribe error:", error);
		}
	);
    FirebasePlugin.subscribe("eew_jp",
		function () {
			console.log("Subscribed");
		},
		function (error) {
			console.error("Subscribe error:", error);
		}
	);
    FirebasePlugin.subscribe("report",
		function () {
			console.log("Subscribed");
		},
		function (error) {
			console.error("Subscribe error:", error);
		}
	);
    FirebasePlugin.subscribe("pga",
		function () {
			console.log("Subscribed");
		},
		function (error) {
			console.error("Subscribe error:", error);
		}
	);
    */

    //onMessage
    FirebasePlugin.onMessageReceived(function(message) {
        console.log("Message received:", message);

        if (message.tap) {
            // 使用者點擊通知
            console.log("Notification tapped");
        } else {
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

async function reportTokenToServer(server, token, user, verifyKey, ){
    const platform = "";
    const app_version = "";
    const device_model = "";
    const payload = {
            user,
            token,
            platform,
            app_version,
            device_model
    };

    await fetch(`https://${server}/api/firebase/registerDevice`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
}

const Firebase = {
    init,
    subscribeTopic,
    unsubscribeTopic,
    reportTokenToServer
};

export default Firebase;