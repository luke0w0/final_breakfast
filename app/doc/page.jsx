import ApiBlock from "./components/apiBlock";

export default function page() {
    return (
        <div className="min-h-screen flex items-start justify-center px-4 py-8">
            <div className="w-full max-w-4xl space-y-8">
                <ApiBlock
                    apiName={"管理員上傳菜單圖片"}
                    bodyDescription={`body是formData，欄位名稱是"file"`}
                    responseDescription={`可利用try catch，把失敗的api回傳為"success": false`}
                    apiType={"post"}
                    apiUrl={"/api/image/upload"}
                    bodyObj={{
                        file: "上傳的圖片",
                    }}
                    responseObj={{
                        success: true,
                        url: "imgUrl",
                    }}
                />
                <ApiBlock
                    apiName={"管理員新增菜單"}
                    apiType={"post"}
                    apiUrl={"/api/menu"}
                    bodyObj={{
                        name: "餐點名稱",
                        description: "餐點敘述",
                        price: 50,
                        imageUrl: "imgUrl",
                        isAvailable: true,
                    }}
                    responseObj={{
                        id: "menuId",
                        name: "餐點名稱",
                        description: "餐點敘述",
                        price: 50,
                        imageUrl: "imgUrl",
                        isAvailable: true,
                    }}
                    responseDescription={`錯誤時response status為500`}
                />
                <ApiBlock
                    apiName={"管理員編輯菜單"}
                    apiType={"put"}
                    apiUrl={"/api/menu/:menuId"}
                    bodyObj={{
                        name: "新餐點名稱",
                        description: "新餐點敘述",
                        price: 35,
                        imageUrl: "newImgUrl",
                        isAvailable: true,
                    }}
                    responseObj={{
                        id: "menuId",
                        name: "新餐點名稱",
                        description: "新餐點敘述",
                        price: 35,
                        imageUrl: "newImgUrl",
                        isAvailable: true,
                    }}
                />
                <ApiBlock
                    apiName={"取得所有菜單"}
                    apiType={"get"}
                    apiUrl={"/api/menu"}
                    responseObj={[
                        {
                            id: "menuItemId",
                            name: "餐點名稱",
                            description: "餐點敘述",
                            price: 35,
                            imageUrl: "imgUrl",
                            isAvailable: true,
                        },
                    ]}
                />
                <ApiBlock
                    apiName={"顧客下單"}
                    apiDescription={
                        "根據orderItems查找資料庫中對應的menu，並依此新增一筆order及對應的orderItems"
                    }
                    apiType={"post"}
                    apiUrl={"/api/orders"}
                    bodyObj={{
                        customerId: "customerId",
                        orderItems: [
                            {
                                menuItemId: "menuItemId",
                                quantity: 1,
                                specialRequest: "備註",
                            },
                        ],
                    }}
                    responseObj={{}}
                    responseDescription={`成功時回傳空物件即可，失敗須回傳status: 500`}
                />
                <ApiBlock
                    apiName={"獲取顧客訂單"}
                    apiType={"get"}
                    apiUrl={"/api/orders/customers/:customerId"}
                    responseObj={[
                        {
                            id: "orderid",
                            customerId: "customerId",
                            status: "PENDING",
                            totalAmount: 80,
                            createdAt: "2025-06-07T06:58:35.725Z",
                            items: [
                                {
                                    id: "orderItemId",
                                    orderId: "orderId",
                                    menuItemId: "menuItemId",
                                    quantity: 1,
                                    specialRequest: "餐點備註",
                                    createdAt: "2025-06-07T06:58:35.725Z",
                                    menuItem: {
                                        name: "餐點名稱",
                                        price: 35,
                                    },
                                },
                            ],
                        },
                    ]}
                    responseDescription={`prisma提示：https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#include-deeply-nested-relations`}
                />
                <ApiBlock
                    apiName={"根據status更改訂單狀態"}
                    apiType={"patch"}
                    apiUrl={"/api/orders/:orderId/status"}
                    bodyObj={{ status: "PENDING" }}
                />
                <ApiBlock
                    apiName={"取得所有待處理訂單"}
                    apiType={"get"}
                    apiUrl={"/api/orders/pending"}
                    responseObj={[
                        {
                            id: "orderId",
                            customerId: "customerId",
                            status: "PENDING",
                            totalAmount: 80,
                            createdAt: "2025-06-07T06:58:35.725Z",
                            customer: {
                                name: "customerName",
                            },
                            items: [
                                {
                                    id: "orderItemId",
                                    quantity: 1,
                                    specialRequest: null,
                                    createdAt: "2025-06-07T06:58:35.725Z",
                                    menuItem: {
                                        name: "經典蛋餅",
                                        price: 35,
                                    },
                                },
                            ],
                        },
                    ]}
                    responseDescription={`prisma提示：https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#include-deeply-nested-relations`}
                />
                <ApiBlock
                    apiName={"傳送通知"}
                    apiType={"post"}
                    apiUrl={"/api/notifications/users/:userId"}
                    bodyObj={{
                        orderId: "orderId",
                        message: "訊息內容",
                    }}
                    responseObj={{}}
                    responseDescription={`成功時回傳空物件即可，失敗須回傳status: 500`}
                />
                <ApiBlock
                    apiName={"獲取廚房訂單"}
                    apiType={"get"}
                    apiUrl={"/api/orders/kitchen"}
                    responseObj={[
                        {
                            id: "orderId",
                            customerId: "customerId",
                            status: "PREPARING",
                            totalAmount: 80,
                            createdAt: "2025-06-07T06:58:35.725Z",
                            items: [
                                {
                                    id: "orderItemId",
                                    quantity: 1,
                                    specialRequest: "餐點備註",
                                    menuItem: {
                                        id: "menuItemId",
                                        name: "餐點名稱",
                                        description: "餐點敘述",
                                        price: 35,
                                        imageUrl: "imgUrl",
                                        isAvailable: true,
                                    },
                                },
                            ],
                        },
                    ]}
                    responseDescription={`prisma提示：https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#include-deeply-nested-relations`}
                />
                {/* TODO:繼續 */}
            </div>
        </div>
    );
}
