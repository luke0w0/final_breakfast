"use client";
import { MenuItem } from "@prisma/client";
import { useEffect, useState } from "react";
// import { createMenuItem, updateMenuItem } from "@/app/menu/actions";

export default function MenuManagementPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newItem, setNewItem] = useState({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        isAvailable: true,
    });
    const [editingId, setEditingId] = useState(null);
    const [editItem, setEditItem] = useState({});

    useEffect(() => {
        fetch("/api/menu")
            .then((res) => res.json())
            .then((data) => setMenuItems(data));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const createdItem = await createMenuItem(
                newItem.name,
                newItem.description,
                newItem.price,
                newItem.imageUrl
            );
            setMenuItems((prev) => [...prev, createdItem]);
            setIsCreating(false);
            setNewItem({
                name: "",
                description: "",
                price: 0,
                imageUrl: "",
                isAvailable: true,
            });
        } catch (error) {
            console.error("Failed to create menu item:", error);
        }
    };

    const startEditing = (item) => {
        setEditingId(item.id);
        setEditItem({
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.imageUrl || "",
            isAvailable: item.isAvailable,
        });
    };

    const handleEdit = async (id) => {
        try {
            const updatedItem = await updateMenuItem(id, editItem);
            setMenuItems((prev) =>
                prev.map((item) => (item.id === id ? updatedItem : item))
            );
            setEditingId(null);
        } catch (error) {
            console.error("Failed to update menu item:", error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">菜單管理</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    新增菜單
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-bold mb-4">新增菜單物品</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                名稱
                            </label>
                            <input
                                type="text"
                                value={newItem.name}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        name: e.target.value,
                                    })
                                }
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                描述
                            </label>
                            <textarea
                                value={newItem.description}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                價格
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={newItem.price}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        price: parseFloat(e.target.value),
                                    })
                                }
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                圖片 URL
                            </label>
                            <input
                                type="text"
                                value={newItem.imageUrl}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        imageUrl: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                                新增
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                            >
                                取消
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                名稱
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                描述
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                價格
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                狀態
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {menuItems.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingId === item.id ? (
                                        <input
                                            type="text"
                                            value={editItem.name || ""}
                                            onChange={(e) =>
                                                setEditItem({
                                                    ...editItem,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="w-full p-1 border rounded"
                                        />
                                    ) : (
                                        <div className="text-sm font-medium text-gray-900">
                                            {item.name}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {editingId === item.id ? (
                                        <textarea
                                            value={editItem.description || ""}
                                            onChange={(e) =>
                                                setEditItem({
                                                    ...editItem,
                                                    description: e.target.value,
                                                })
                                            }
                                            className="w-full p-1 border rounded"
                                        />
                                    ) : (
                                        <div className="text-sm text-gray-500">
                                            {item.description}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingId === item.id ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={editItem.price || 0}
                                            onChange={(e) =>
                                                setEditItem({
                                                    ...editItem,
                                                    price: parseFloat(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className="w-full p-1 border rounded"
                                        />
                                    ) : (
                                        <div className="text-sm text-gray-500">
                                            ${item.price.toFixed(2)}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingId === item.id ? (
                                        <select
                                            value={
                                                editItem.isAvailable
                                                    ? "true"
                                                    : "false"
                                            }
                                            onChange={(e) =>
                                                setEditItem({
                                                    ...editItem,
                                                    isAvailable:
                                                        e.target.value ===
                                                        "true",
                                                })
                                            }
                                            className="w-full p-1 border rounded"
                                        >
                                            <option value="true">
                                                Available
                                            </option>
                                            <option value="false">
                                                Unavailable
                                            </option>
                                        </select>
                                    ) : (
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.isAvailable
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {item.isAvailable
                                                ? "Available"
                                                : "Unavailable"}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {editingId === item.id ? (
                                        <div className="space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleEdit(item.id)
                                                }
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setEditingId(null)
                                                }
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => startEditing(item)}
                                            className="text-blue-600 hover:text-blue-900 mr-2"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
