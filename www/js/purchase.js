const SUBSCRIPTION_ID = "rfeq_premium";
let subscriptionProduct = null;

const events = {
    purchaseStarted: null,
    purchaseCompleted: null
}

export function initializePurchase() {
    const {store, ProductType, Platform, LogLevel} = CdvPurchase;

    store.verbosity = LogLevel.DEBUG;

    store.register({
        id: SUBSCRIPTION_ID,
        type: ProductType.PAID_SUBSCRIPTION,
        platform: Platform.GOOGLE_PLAY
    });

    store.when()
        .productUpdated(product => {
            if (product.id !== SUBSCRIPTION_ID) return;

            subscriptionProduct = product;

            const offer = product.getOffer();
            const pricingPhase = offer?.pricingPhases?.[0];

            //document.getElementById("subscription-name").textContent = product.title || "RFEQ 進階會員";
            //document.getElementById("subscription-price").textContent = pricingPhase?.price || "無法取得價格";
            //document.getElementById("subscribe-button").disabled = !offer;
        })
        .approved(transaction => {
            //document.getElementById("subscription-status").textContent = "付款完成，正在驗證...";
            transaction.verify();
        })
        .verified(receipt => {
            receipt.finish();
            //document.getElementById("subscription-status").textContent = "訂閱驗證成功";
            refreshMemberStatus();
        })
        .unverified(receipt => {
            console.error("訂閱驗證失敗", receipt);
            //document.getElementById("subscription-status").textContent = "無法驗證訂閱";
        });

    store.error(error => {
        console.error("Google Play Billing error", error);

        if (error.code === CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
            //document.getElementById("subscription-status").textContent = "已取消付款";
        } else {
            //document.getElementById("subscription-status").textContent = "購買系統發生錯誤";
        }
    });

    store.initialize([Platform.GOOGLE_PLAY]);
}

export async function purchaseSubscription() {
    if (!subscriptionProduct) {
        console.error("訂閱產品尚未初始化");
        return;
    }

    const offer = subscriptionProduct.getOffer();
    if (!offer) {
        //document.getElementById("subscription-status").textContent = "目前沒有可購買的方案";
        return;
    }

    events.purchaseStarted?.();
    const error = await offer.order();
    events.purchaseCompleted?.(error);

    if (!error) return;

    if (error.code === CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
        //document.getElementById("subscription-status").textContent = "已取消購買";
    } else {
        console.error(error);
        //document.getElementById("subscription-status").textContent = "無法完成購買";
    }
}

function on(event, callback) {
    if (events.hasOwnProperty(event)) {
        events[event] = callback;
    }
}

export default {
    initializePurchase,
    purchaseSubscription,
    on
};