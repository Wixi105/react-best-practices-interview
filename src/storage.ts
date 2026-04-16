import type{ Todo } from "./type"

const STORAGE_KEY = "todo-app-todos"

export function loadFromStorage(): Todo[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = JSON.parse(raw as string)
  return parsed
}

export function saveToStorage(data: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function deleteFromStorage(key: string) {
  localStorage.removeItem(STORAGE_KEY)
}

