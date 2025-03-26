"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAdminAccess } from "@/app/actions/auth";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  toggleItemStatus,
  Item,
} from "@/app/actions/reservation";
import { getCategories, Category } from "@/app/actions/reservation";

export default function AdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: 0,
    category_id: 0,
    is_active: true,
  });

  useEffect(() => {
    const checkAccess = async () => {
      const isAdmin = await checkAdminAccess();
      if (!isAdmin) {
        router.push("/");
        return;
      }
      loadData();
    };
    checkAccess();
  }, [router]);

  const loadData = async () => {
    try {
      const [itemsData, categoriesData] = await Promise.all([
        getItems(),
        getCategories(),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      setError("데이터 로딩 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createItem(newItem);
      setNewItem({
        name: "",
        description: "",
        price: 0,
        category_id: 0,
        is_active: true,
      });
      loadData();
    } catch (error) {
      setError("아이템 생성 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await updateItem({
        ...editingItem,
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        category_id: editingItem.category_id,
        is_active: editingItem.is_active,
      });
      setEditingItem(null);
      loadData();
    } catch (error) {
      setError("아이템 수정 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("정말로 이 아이템을 삭제하시겠습니까?")) return;

    try {
      await deleteItem(id);
      loadData();
    } catch (error) {
      setError("아이템 삭제 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toggleItemStatus(id, !currentStatus);
      loadData();
    } catch (error) {
      setError("아이템 상태 변경 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">아이템 관리</h1>

      {/* 아이템 생성 폼 */}
      <form onSubmit={handleCreateItem} className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">새 아이템 추가</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">이름</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">설명</label>
            <input
              type="text"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">가격</label>
            <input
              type="number"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: Number(e.target.value) })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">카테고리</label>
            <select
              value={newItem.category_id}
              onChange={(e) =>
                setNewItem({ ...newItem, category_id: Number(e.target.value) })
              }
              className="w-full p-2 border rounded"
              required
            >
              <option value="">선택하세요</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          추가
        </button>
      </form>

      {/* 아이템 목록 */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 border rounded flex justify-between items-center"
          >
            {editingItem?.id === item.id ? (
              <form onSubmit={handleUpdateItem} className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">이름</label>
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, name: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">설명</label>
                    <input
                      type="text"
                      value={editingItem.description}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">가격</label>
                    <input
                      type="number"
                      value={editingItem.price}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">카테고리</label>
                    <select
                      value={editingItem.category_id}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          category_id: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded"
                      required
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  <p className="text-gray-600">
                    가격: {item.price.toLocaleString()}원
                  </p>
                  <p className="text-gray-600">
                    카테고리:{" "}
                    {categories.find((c) => c.id === item.category_id)?.name}
                  </p>
                  <p className="text-gray-600">
                    상태: {item.is_active ? "활성" : "비활성"}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleToggleStatus(item.id, item.is_active)}
                    className={`px-4 py-2 rounded ${
                      item.is_active
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white`}
                  >
                    {item.is_active ? "비활성화" : "활성화"}
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
