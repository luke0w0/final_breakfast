import mqtt from "mqtt";

const MQTT_BROKER_URL = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || "wss://broker.emqx.io:8084/mqtt";
const MQTT_TOPIC = process.env.NEXT_PUBLIC_MQTT_TOPIC || "luke0926/mqtt/breakfast";

let client = null;
let isConnecting = false;
let connectionPromise = null;

export const getMqttClient = () => {
    if (!client && !isConnecting) {
        isConnecting = true;
        console.log('正在連接 MQTT broker...');
        
        // 創建一個 Promise 來處理連接
        connectionPromise = new Promise((resolve, reject) => {
            client = mqtt.connect(MQTT_BROKER_URL, {
                reconnectPeriod: 1000,
                connectTimeout: 30 * 1000,
            });
            
            client.on("connect", () => {
                console.log("已連接到 MQTT broker");
                client.subscribe(MQTT_TOPIC);
                isConnecting = false;
                resolve(client);
            });

            client.on("error", (error) => {
                console.error("MQTT 錯誤:", error);
                isConnecting = false;
                reject(error);
            });

            client.on("close", () => {
                console.log("MQTT 連接已關閉");
                client = null;
                isConnecting = false;
            });
        });
    }
    return client;
};

export const publishMessage = async (message) => {
    try {
        // 確保客戶端已連接
        if (!client || !client.connected) {
            console.log('MQTT 客戶端未連接，嘗試重新連接...');
            if (!connectionPromise) {
                getMqttClient();
            }
            // 等待連接完成
            await connectionPromise;
        }

        if (client && client.connected) {
            console.log('正在發送 MQTT 訊息:', message);
            return new Promise((resolve, reject) => {
                client.publish(MQTT_TOPIC, JSON.stringify(message), (error) => {
                    if (error) {
                        console.error('MQTT 訊息發送失敗:', error);
                        reject(error);
                    } else {
                        console.log('MQTT 訊息發送成功');
                        resolve();
                    }
                });
            });
        } else {
            throw new Error('MQTT 客戶端未連接');
        }
    } catch (error) {
        console.error('MQTT 發送過程發生錯誤:', error);
        throw error;
    }
};

export const subscribeToTopic = (callback) => {
    const mqttClient = getMqttClient();
    if (mqttClient) {
        mqttClient.on("message", (topic, message) => {
            try {
                const parsedMessage = JSON.parse(message.toString());
                callback(parsedMessage);
            } catch (error) {
                console.error("解析 MQTT 訊息失敗:", error);
            }
        });
    }
}; 