import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const STORAGE_KEY = "todo-app-todos";

export interface SeedData {
	id: number;
	name?: string;
	completed?: boolean;
	done?: boolean;
	isDone?: boolean;
}

if (!localStorage.getItem(STORAGE_KEY)) {
	const seedData = [
		{ id: 1, name: "Buy groceries", completed: false },
		{ id: 2, name: "Walk the dog", done: true },
		{ id: 3, name: "Read a book", completed: false, done: false },
		{ id: 4, name: "Fix the bug", isDone: false },
		{ id: 5, name: "Call mom", completed: null },
		{ id: 6, completed: false },
	] satisfies SeedData[];

	localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
