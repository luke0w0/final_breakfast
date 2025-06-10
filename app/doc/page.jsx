import ApiBlock from "./components/apiBlock";

export default function page() {
    return (
        <div className="min-h-screen flex items-start justify-center px-4 py-8">
            <div className="w-full max-w-4xl space-y-8">
                <ApiBlock
                    apiName={"管理員上傳菜單圖片 ( 1分 )"}
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
                    apiName={"管理員新增菜單( 1分 )"}
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
                    apiName={"管理員編輯菜單( 1分 )"}
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
                    apiName={"取得所有菜單( 1分 )"}
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
                    apiName={"顧客下單( 2分 )"}
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
                    responseObj={{
                        id: "orderId",
                        customerId: "customerId",
                        totalAmount: 35,
                        customer: {
                            name: "customerName",
                        },
                        items: [
                            {
                                menuItemId: "menuItemId",
                                quantity: 1,
                                specialRequest: "餐點備註",
                                menuItem: {
                                    name: "餐點名稱",
                                    price: 35,
                                },
                            },
                        ],
                        status: "PENDING",
                        createdAt: "2025-06-10T14:19:40.204Z",
                    }}
                />
                <ApiBlock
                    apiName={"取得顧客訂單( 2分 )"}
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
                    responseDescription={`nested relations prisma 提示：https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#include-deeply-nested-relations`}
                />
                <ApiBlock
                    apiName={"根據status更改訂單狀態( 1分 )"}
                    apiType={"patch"}
                    apiUrl={"/api/orders/:orderId/status"}
                    bodyObj={{ status: "PENDING" }}
                />
                <ApiBlock
                    apiName={"取得所有待處理訂單( 2分 )"}
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
                    responseDescription={`nested relations prisma 提示：https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#include-deeply-nested-relations`}
                />
                <ApiBlock
                    apiName={"傳送通知( 1分 )"}
                    apiType={"post"}
                    apiUrl={"/api/notifications/users/:userId"}
                    bodyObj={{
                        orderId: "orderId",
                        message: "訊息內容",
                    }}
                    responseObj={{
                        id: "notificationId",
                        userId: "userId",
                        orderId: "orderId",
                        message: "訊息內容",
                        isRead: false,
                        createdAt: "2025-06-10T14:03:40.066Z",
                    }}
                />
                <ApiBlock
                    apiName={"取得使用者通知( 1分 )"}
                    apiType={"get"}
                    apiUrl={"/api/notifications/users/:userId"}
                    responseObj={[
                        {
                            id: "notificationId",
                            userId: "userId",
                            orderId: "orderId",
                            message: "message content",
                            isRead: false,
                            createdAt: "2025-06-08T09:17:50.558Z",
                        },
                    ]}
                />
                <ApiBlock
                    apiName={"刪除通知( 1分 )"}
                    apiType={"delete"}
                    apiUrl={"/api/notifications/:notificationId"}
                    responseObj={{}}
                    responseDescription={`成功時回傳空物件即可，失敗須回傳status: 500`}
                />
                <ApiBlock
                    apiName={"取得廚房訂單( 2分 )"}
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
                    responseDescription={`nested relations prisma 提示：https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#include-deeply-nested-relations`}
                />
                <ApiBlock
                    apiName={"取得製作完成的訂單( 2分 )"}
                    apiType={"get"}
                    apiUrl={"/api/orders/ready"}
                    responseObj={[
                        {
                            id: "orderId",
                            status: "READY",
                            totalAmount: 80,
                            createdAt: "2025-06-08T09:17:33.585Z",
                            customer: {
                                name: "customerName",
                            },
                            items: [
                                {
                                    id: "orderItemId",
                                    quantity: 1,
                                    specialRequest: "餐點備註",
                                    menuItem: {
                                        name: "餐點名稱",
                                        price: 45,
                                    },
                                },
                            ],
                        },
                    ]}
                    responseDescription={`nested relations prisma提示：https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries#include-deeply-nested-relations`}
                />
                {/* TODO:繼續 */}
            </div>
        </div>
    );
}
