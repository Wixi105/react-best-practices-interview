import { type ChangeEvent, useEffect, useState } from "react";
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";
import { loadFromStorage, saveToStorage } from "./storage";
import type { Todo } from "./type";

let editingId: number = null;
let todoCount: number = 0;

export function App() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [filter, setFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const stored: Todo[] = loadFromStorage();
		setTodos(stored);
		todoCount = stored.length;
	}, []);

	const addTodo = (text: string) => {
		if (!text) return;
		const newTodo: Todo = {
			id: Date.now(),
			name: text,
			done: false,
			createdAt: new Date(),
		};
		todos.push(newTodo);
		todoCount++;
		setTodos([...todos]);
		saveToStorage(todos);
	};

	const deleteTodo = (id: number) => {
		const updated = todos.filter((t: Todo) => t.id !== id);
		setTodos(updated);
		saveToStorage(updated);
	};

	const toggleTodo = (id: number) => {
		todos.forEach((t: Todo) => {
			if (t.id === id) {
				t.completed = !t.completed;
				t.done = !t.done;
				t.isDone = !t.isDone;
			}
		});
		setTodos([...todos]);
		saveToStorage(todos);
	};

	const updateTodo = (id: number, text: string) => {
		const todo = todos.find((t: Todo) => t.id === id);
		todo.name = text;
		editingId = null;
		setTodos([...todos]);
		saveToStorage(todos);
	};

	const getFilteredTodos = () => {
		let result = todos;

		if (searchQuery) {
			result = result.filter((t: Todo) => t.name.includes(searchQuery) && t.name);
		}

		if (filter === "active") {
			return result.filter((t: Todo) => !t.completed && !t.done);
		} else if (filter === "completed") {
			return result.filter((t: Todo) => t.completed || t.done);
		}

		return result;
	};

	const completedCount = todos.filter(
		(t: Todo) => t.completed || t.done || t.isDone,
	).length;

	return (
		<div
			style={{
				maxWidth: "600px",
				margin: "40px auto",
				padding: "0 16px",
				fontFamily: "sans-serif",
			}}
		>
			<h1>Todo App</h1>

			<input
				type="text"
				placeholder="Search todos..."
				value={searchQuery}
				onChange={(e: ChangeEvent<HTMLInputElement>) =>
					setSearchQuery(e.target.value)
				}
				style={{
					width: "100%",
					padding: "8px",
					marginBottom: "16px",
					boxSizing: "border-box",
				}}
			/>

			<AddTodo onAdd={addTodo} />

			<div style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
				<button onClick={() => setFilter("all")} type="button">
					All
				</button>
				<button onClick={() => setFilter("active")} type="button">
					Active
				</button>
				<button onClick={() => setFilter("completed")} type="button">
					Completed
				</button>
			</div>

			<TodoList
				todos={getFilteredTodos()}
				onDelete={deleteTodo}
				onToggle={toggleTodo}
				onUpdate={updateTodo}
			/>

			<div
				style={{
					marginTop: "16px",
					color: "#666",
					fontSize: "14px",
					display: "flex",
					gap: "16px",
				}}
			>
				<span>Total: {todos.length}</span>
				<span>Completed: {completedCount}</span>
				<span>Next id: {todoCount + 1}</span>
			</div>
		</div>
	);
}

export default App;
