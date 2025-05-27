import ApiBlock from "./components/apiBlock";

export default function page() {
    return (
        <div className="min-h-screen flex items-start justify-center px-4 py-8">
            <div className="w-full max-w-4xl space-y-8">
                <ApiBlock
                    apiName={"顧客下單"}
                    apiDescription={
                        "從資料庫裡查找對應的menuItems，並在資料庫新增一筆order及對應的orderItems"
                    }
                    apiType={"post"}
                    apiUrl={"/api/orders/customer"}
                    authorizationList={["全部"]}
                    bodyObj={{
                        customerId: "uuid",
                        orders: [
                            {
                                menuItemId: "uuid",
                                quantity: 1,
                                specialRequest: "備註",
                            },
                        ],
                    }}
                    responseObj={[
                        {
                            id: 1,
                            name: "沙拉",
                            price: 30,
                        },
                    ]}
                />
                <ApiBlock
                    apiName={"取得所有菜單"}
                    apiType={"get"}
                    apiUrl={"/menus"}
                    authorizationList={["全部"]}
                    responseObj={[
                        {
                            id: 1,
                            name: "沙拉",
                            price: 30,
                        },
                    ]}
                />
                <ApiBlock
                    apiName={"依照id取得菜單"}
                    apiType={"get"}
                    apiUrl={"/menus/:id"}
                    authorizationList={["全部"]}
                    responseObj={{
                        id: 1,
                        name: "沙拉",
                        price: 30,
                    }}
                />
                <ApiBlock
                    apiName={"新增菜單"}
                    apiType={"post"}
                    apiUrl={"/menus/:id"}
                    authorizationList={["管理員"]}
                    bodyObj={{
                        name: "沙拉",
                        price: 30,
                    }}
                    responseObj={{
                        id: 1,
                        name: "沙拉",
                        price: 30,
                    }}
                />
                <ApiBlock
                    apiName={"修改菜單"}
                    apiType={"patch"}
                    apiUrl={"/menus/:id"}
                    authorizationList={["管理員"]}
                    bodyObj={{
                        name: "熱狗",
                        price: 25,
                    }}
                    responseObj={{
                        id: 1,
                        name: "熱狗",
                        price: 25,
                    }}
                />
                <ApiBlock
                    apiName={"刪除菜單"}
                    apiType={"delete"}
                    apiUrl={"/menus/:id"}
                    authorizationList={["管理員"]}
                    responseObj={{
                        id: 1,
                        name: "沙拉",
                        price: 30,
                    }}
                />
            </div>
        </div>
    );
}
