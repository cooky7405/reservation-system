"use server";

import { fetchApi } from "@/utils/api";

export interface Category {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: number;
  item_id: number;
  name: string;
  description: string;
  category_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  date: string;
  isAvailable: boolean;
}

export interface Reservation {
  id: number;
  item: Item;
  slot: TimeSlot;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}

interface CreateItemRequest {
  name: string;
  description: string;
  category_id: number;
  is_active: boolean;
}

interface UpdateItemRequest extends CreateItemRequest {
  id: number;
}

export async function getCategories(): Promise<Category[]> {
  console.log("[getCategories] 카테고리 조회 시작");
  const response = await fetchApi<any>("/manage/categories");
  console.log("[getCategories] API 응답:", response);

  // 응답이 직접 배열인 경우
  if (Array.isArray(response)) {
    console.log("[getCategories] 카테고리 목록 (배열):", response);
    return response;
  }

  // 응답에 categories 필드가 있는 경우
  if (response && response.categories && Array.isArray(response.categories)) {
    console.log(
      "[getCategories] 카테고리 목록 (categories):",
      response.categories
    );
    return response.categories;
  }

  // 응답에 data 필드가 있는 경우
  if (response && response.data) {
    // data가 배열인 경우
    if (Array.isArray(response.data)) {
      console.log("[getCategories] 카테고리 목록 (data 배열):", response.data);
      return response.data;
    }

    // data.categories가 있는 경우
    if (response.data.categories && Array.isArray(response.data.categories)) {
      console.log(
        "[getCategories] 카테고리 목록 (data.categories):",
        response.data.categories
      );
      return response.data.categories;
    }
  }

  console.log("[getCategories] 유효한 카테고리 데이터 없음");
  return [];
}

export async function getItems(): Promise<Item[]> {
  console.log("[getItems] 아이템 조회 시작");
  const response = await fetchApi<any>("/manage/items");
  console.log("[getItems] API 응답:", response);

  let items: Item[] = [];

  // 응답이 직접 배열인 경우
  if (Array.isArray(response)) {
    console.log("[getItems] 아이템 목록 (배열):", response);
    items = response;
  }
  // 응답에 items 필드가 있는 경우
  else if (response && response.items && Array.isArray(response.items)) {
    console.log("[getItems] 아이템 목록 (items):", response.items);
    items = response.items;
  }
  // 응답에 data 필드가 있는 경우
  else if (response && response.data) {
    // data가 배열인 경우
    if (Array.isArray(response.data)) {
      console.log("[getItems] 아이템 목록 (data 배열):", response.data);
      items = response.data;
    }
    // data.items가 있는 경우
    else if (response.data.items && Array.isArray(response.data.items)) {
      console.log("[getItems] 아이템 목록 (data.items):", response.data.items);
      items = response.data.items;
    }
  }

  // item_id 필드가 없는 항목에 대해 id 값을 복사
  const processedItems = items.map((item) => {
    if (item.item_id === undefined) {
      return { ...item, item_id: item.id };
    }
    return item;
  });

  console.log("[getItems] 처리된 아이템 목록:", processedItems);
  return processedItems;
}

export async function getTimeSlots(): Promise<TimeSlot[]> {
  const response = await fetchApi<TimeSlot[]>("/manage/time-slots");

  if (!response.data) {
    return [];
  }

  if (!Array.isArray(response.data)) {
    console.error("[getTimeSlots] 응답 데이터가 배열이 아님:", response.data);
    return [];
  }

  return response.data;
}

export async function createItem(data: CreateItemRequest): Promise<Item> {
  try {
    console.log("[Server Action] 아이템 생성 시도:", data);

    const response = await fetchApi<Item>("/manage/items", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.error) {
      console.error("[Server Action] 아이템 생성 실패:", response.error);
      throw new Error(response.error);
    }

    console.log("[Server Action] 아이템 생성 성공:", {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    console.error("[Server Action] 아이템 생성 실패:", error);
    throw error;
  }
}

export async function updateItem(data: UpdateItemRequest): Promise<Item> {
  try {
    console.log("[Server Action] 아이템 수정 시도:", data);

    const response = await fetchApi<Item>(`/manage/items/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (response.error) {
      console.error("[Server Action] 아이템 수정 실패:", response.error);
      throw new Error(response.error);
    }

    console.log("[Server Action] 아이템 수정 성공:", {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    console.error("[Server Action] 아이템 수정 실패:", error);
    throw error;
  }
}

export async function deleteItem(id: number): Promise<void> {
  try {
    console.log("[Server Action] 아이템 삭제 시도:", { id, item_id: id });

    const response = await fetchApi<void>(`/manage/items/${id}`, {
      method: "DELETE",
    });

    if (response.error) {
      console.error("[Server Action] 아이템 삭제 실패:", response.error);
      throw new Error(response.error);
    }

    console.log("[Server Action] 아이템 삭제 성공:", {
      status: response.status,
    });
  } catch (error) {
    console.error("[Server Action] 아이템 삭제 실패:", error);
    throw error;
  }
}

export async function toggleItemStatus(
  id: number,
  isActive: boolean
): Promise<Item> {
  try {
    console.log("[Server Action] 아이템 상태 변경 시도:", {
      id,
      item_id: id,
      isActive,
    });

    const response = await fetchApi<Item>(`/manage/items/${id}/toggle-status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    });

    if (response.error) {
      console.error("[Server Action] 아이템 상태 변경 실패:", response.error);
      throw new Error(response.error);
    }

    console.log("[Server Action] 아이템 상태 변경 성공:", {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    console.error("[Server Action] 아이템 상태 변경 실패:", error);
    throw error;
  }
}

export async function createReservation(
  itemId: number,
  slotId: number
): Promise<Reservation> {
  const response = await fetchApi<Reservation>("/oper/reserves", {
    method: "POST",
    body: JSON.stringify({ itemId, slotId }),
  });
  return response.data;
}

export async function cancelReservation(
  reservationId: number
): Promise<Reservation> {
  const response = await fetchApi<Reservation>(
    `/oper/reserves/${reservationId}/cancel`,
    {
      method: "POST",
    }
  );
  return response.data;
}

export async function getUserReservations(): Promise<Reservation[]> {
  const response = await fetchApi<Reservation[]>("/oper/reserves");

  if (!response.data) {
    return [];
  }

  if (!Array.isArray(response.data)) {
    console.error(
      "[getUserReservations] 응답 데이터가 배열이 아님:",
      response.data
    );
    return [];
  }

  return response.data;
}
