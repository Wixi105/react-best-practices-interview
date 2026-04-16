import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import * as storage from "../storage";
import type { Todo } from "../type";

vi.mock("../storage", () => ({
	loadFromStorage: vi.fn(),
	saveToStorage: vi.fn(),
}));

vi.mock("../components/AddTodo", () => ({
	default: ({ onAdd }: { onAdd: (text: string) => void }) => (
		<div>
			<input data-testid="add-input" />
			<button
				type="button"
				onClick={() => {
					const input = document.querySelector<HTMLInputElement>(
						"[data-testid='add-input']",
					)!;
					onAdd(input.value);
				}}
			>
				Add
			</button>
		</div>
	),
}));

vi.mock("../components/TodoList", () => ({
	default: ({
		todos,
		onDelete,
		onToggle,
		onUpdate,
	}: {
		todos: Todo[];
		onDelete: (id: number) => void;
		onToggle: (id: number) => void;
		onUpdate: (id: number, text: string) => void;
	}) => (
		<ul>
			{todos.map((t) => (
				<li key={t.id} data-testid={`todo-${t.id}`}>
					<span>{t.name}</span>
					<button type="button" onClick={() => onDelete(t.id)}>
						Delete
					</button>
					<button type="button" onClick={() => onToggle(t.id)}>
						Toggle
					</button>
					<button
						type="button"
						onClick={() => onUpdate(t.id, `${t.name} edited`)}
					>
						Edit
					</button>
				</li>
			))}
		</ul>
	),
}));

function makeTodo(overrides: Partial<Todo> = {}): Todo {
	return {
		id: Date.now(),
		name: "Test todo",
		done: false,
		createdAt: new Date(),
		...overrides,
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(storage.loadFromStorage).mockReturnValue([]);
});

describe("App — initial render", () => {
	it("renders heading and UI chrome", () => {
		render(<App />);
		expect(screen.getByText("Todo App")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Search todos...")).toBeInTheDocument();
		expect(screen.getByText("All")).toBeInTheDocument();
		expect(screen.getByText("Active")).toBeInTheDocument();
		expect(screen.getByText("Completed")).toBeInTheDocument();
	});

	it("loads todos from storage on mount", async () => {
		const stored = [makeTodo({ id: 1, name: "Stored todo" })];
		vi.mocked(storage.loadFromStorage).mockReturnValue(stored);
		render(<App />);
		await waitFor(() => {
			expect(screen.getByText("Stored todo")).toBeInTheDocument();
		});
	});

	it("shows correct totals from storage", async () => {
		const stored = [makeTodo({ id: 1 }), makeTodo({ id: 2 })];
		vi.mocked(storage.loadFromStorage).mockReturnValue(stored);
		render(<App />);
		await waitFor(() => {
			expect(screen.getByText(/Total \(global\): 2/)).toBeInTheDocument();
		});
	});
});

describe("App — addTodo", () => {
	it("adds a new todo and saves to storage", async () => {
		render(<App />);
		await userEvent.type(screen.getByTestId("add-input"), "Buy milk");
		fireEvent.click(screen.getByText("Add"));
		expect(screen.getByText("Buy milk")).toBeInTheDocument();
		expect(vi.mocked(storage.saveToStorage)).toHaveBeenCalled();
	});

	it("does not add a todo when text is empty", () => {
		render(<App />);
		fireEvent.click(screen.getByText("Add"));
		expect(vi.mocked(storage.saveToStorage)).not.toHaveBeenCalled();
		expect(screen.getByText(/Total \(global\): 0/)).toBeInTheDocument();
	});

	it("increments the total count after adding", async () => {
		render(<App />);
		await userEvent.type(screen.getByTestId("add-input"), "New task");
		fireEvent.click(screen.getByText("Add"));
		expect(screen.getByText(/Total \(global\): 1/)).toBeInTheDocument();
	});
});

describe("App — deleteTodo", () => {
	it("removes the todo from the list", async () => {
		const todo = makeTodo({ id: 42, name: "To delete" });
		vi.mocked(storage.loadFromStorage).mockReturnValue([todo]);
		render(<App />);
		await waitFor(() => screen.getByText("To delete"));
		fireEvent.click(screen.getAllByText("Delete")[0]);
		expect(screen.queryByText("To delete")).not.toBeInTheDocument();
	});

	it("persists the deletion to storage", async () => {
		const todo = makeTodo({ id: 99, name: "Gone" });
		vi.mocked(storage.loadFromStorage).mockReturnValue([todo]);
		render(<App />);
		await waitFor(() => screen.getByText("Gone"));
		fireEvent.click(screen.getAllByText("Delete")[0]);
		const saved = vi.mocked(storage.saveToStorage).mock.calls.at(-1)?.[0] as Todo[];
		expect(saved.find((t) => t.id === 99)).toBeUndefined();
	});
});

describe("App — toggleTodo", () => {
	it("toggles a todo and saves", async () => {
		const todo = makeTodo({ id: 7, name: "Toggle me", done: false });
		vi.mocked(storage.loadFromStorage).mockReturnValue([todo]);
		render(<App />);
		await waitFor(() => screen.getByText("Toggle me"));
		fireEvent.click(screen.getAllByText("Toggle")[0]);
		expect(vi.mocked(storage.saveToStorage)).toHaveBeenCalled();
		const saved = vi.mocked(storage.saveToStorage).mock.calls.at(-1)?.[0] as Todo[];
		expect(saved[0].done).toBe(true);
	});

	it("BUG — completedCount increments but filter=completed misses isDone-only todos", async () => {
		const todo = makeTodo({ id: 8, name: "Buggy toggle" });
		vi.mocked(storage.loadFromStorage).mockReturnValue([todo]);
		render(<App />);
		await waitFor(() => screen.getByText("Buggy toggle"));
		fireEvent.click(screen.getAllByText("Toggle")[0]);
		expect(screen.getByText(/Completed: 1/)).toBeInTheDocument();
	});
});

describe("App — updateTodo", () => {
	it("updates todo name and saves", async () => {
		const todo = makeTodo({ id: 5, name: "Original" });
		vi.mocked(storage.loadFromStorage).mockReturnValue([todo]);
		render(<App />);
		await waitFor(() => screen.getByText("Original"));
		fireEvent.click(screen.getAllByText("Edit")[0]);
		expect(screen.getByText("Original edited")).toBeInTheDocument();
		expect(vi.mocked(storage.saveToStorage)).toHaveBeenCalled();
	});
});

describe("App — search", () => {
	it("filters todos by search query", async () => {
		vi.mocked(storage.loadFromStorage).mockReturnValue([
			makeTodo({ id: 1, name: "Buy milk" }),
			makeTodo({ id: 2, name: "Walk dog" }),
		]);
		render(<App />);
		await waitFor(() => screen.getByText("Buy milk"));
		await userEvent.type(
			screen.getByPlaceholderText("Search todos..."),
			"milk",
		);
		expect(screen.getByText("Buy milk")).toBeInTheDocument();
		expect(screen.queryByText("Walk dog")).not.toBeInTheDocument();
	});

	it("shows all todos when search is cleared", async () => {
		vi.mocked(storage.loadFromStorage).mockReturnValue([
			makeTodo({ id: 1, name: "Buy milk" }),
			makeTodo({ id: 2, name: "Walk dog" }),
		]);
		render(<App />);
		await waitFor(() => screen.getByText("Buy milk"));
		const search = screen.getByPlaceholderText("Search todos...");
		await userEvent.type(search, "milk");
		await userEvent.clear(search);
		expect(screen.getByText("Buy milk")).toBeInTheDocument();
		expect(screen.getByText("Walk dog")).toBeInTheDocument();
	});
});

describe("App — filter buttons", () => {
	it("Active filter hides completed todos", async () => {
		vi.mocked(storage.loadFromStorage).mockReturnValue([
			makeTodo({ id: 1, name: "Active task", done: false }),
			makeTodo({ id: 2, name: "Done task", done: true }),
		]);
		render(<App />);
		await waitFor(() => screen.getByText("Active task"));
		fireEvent.click(screen.getByText("Active"));
		expect(screen.getByText("Active task")).toBeInTheDocument();
		expect(screen.queryByText("Done task")).not.toBeInTheDocument();
	});

	it("Completed filter shows only done todos", async () => {
		vi.mocked(storage.loadFromStorage).mockReturnValue([
			makeTodo({ id: 1, name: "Active task", done: false }),
			makeTodo({ id: 2, name: "Done task", done: true }),
		]);
		render(<App />);
		await waitFor(() => screen.getByText("Done task"));
		fireEvent.click(screen.getByText("Completed"));
		expect(screen.queryByText("Active task")).not.toBeInTheDocument();
		expect(screen.getByText("Done task")).toBeInTheDocument();
	});

	it("All filter restores full list", async () => {
		vi.mocked(storage.loadFromStorage).mockReturnValue([
			makeTodo({ id: 1, name: "Active task" }),
			makeTodo({ id: 2, name: "Done task", done: true }),
		]);
		render(<App />);
		await waitFor(() => screen.getByText("Active task"));
		fireEvent.click(screen.getByText("Completed"));
		fireEvent.click(screen.getByText("All"));
		expect(screen.getByText("Active task")).toBeInTheDocument();
		expect(screen.getByText("Done task")).toBeInTheDocument();
	});
});