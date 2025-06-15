// MQTT 主題相關函數

// 訂單結帳主題
export const getOrderCheckoutTopic = () => {
    return "orders/checkout";
};

// 顧客取消訂單主題
export const getCustomerCancelOrderTopic = (orderId) => {
    return `orders/cancel/${orderId}`;
};

// 訂單狀態更新主題
export const getOrderStatusUpdateTopic = (orderId) => {
    return `orders/status/${orderId}`;
};

// 廚房訂單主題
export const getKitchenOrderTopic = () => {
    return "orders/kitchen";
};

// 訂單完成主題
export const getOrderCompleteTopic = (orderId) => {
    return `orders/complete/${orderId}`;
};

// 通知主題
export const getNotificationTopic = (userId) => {
    return `notifications/${userId}`;
}; 