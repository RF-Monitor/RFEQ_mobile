function requestNotificationPermission(permissions) {
    permissions.requestPermission(
        permissions.POST_NOTIFICATIONS,
        function (status) {
            if (status.hasPermission) {
                console.log("通知權限已取得");
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

export default function init(){
    const permissions = cordova.plugins.permissions;

    // Android 13+ 通知權限
    if (cordova.platformId === "android") {
        permissions.checkPermission(
            permissions.POST_NOTIFICATIONS,
            function (status) {
                if (status.hasPermission) {
                    setupFCM();
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
    FirebasePlugin.subscribe("eew_tw",
		function () {
			console.log("Subscribed");
		},
		function (error) {
			console.error("Subscribe error:", error);
		}
	);

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