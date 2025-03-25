"use server";

import { fetchApi } from "@/utils/api";

export interface Category {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  name: string;
  categoryId: number;
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
