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
  name: string;
  description: string;
  price: number;
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
  price: number;
  category_id: number;
  is_active: boolean;
}

interface UpdateItemRequest extends CreateItemRequest {
  id: number;
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetchApi<Category[]>("/manage/categories");

  if (!response.data) {
    return [];
  }

  if (!Array.isArray(response.data)) {
    console.error("[getCategories] 응답 데이터가 배열이 아님:", response.data);
    return [];
  }

  return response.data;
}

export async function getItems(): Promise<Item[]> {
  const response = await fetchApi<Item[]>("/manage/items");

  if (!response.data) {
    return [];
  }

  if (!Array.isArray(response.data)) {
    console.error("[getItems] 응답 데이터가 배열이 아님:", response.data);
    return [];
  }

  return response.data;
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
    console.log("[Server Action] 아이템 삭제 시도:", { id });

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
    console.log("[Server Action] 아이템 상태 변경 시도:", { id, isActive });

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
