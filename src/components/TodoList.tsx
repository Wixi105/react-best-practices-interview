interface TodoListProps {
	todos: Todo[];
	onDelete: (id: number) => void;
	onToggle: (id: number) => void;
	onUpdate: (id: number, text: string) => void;
}

export default function TodoList({
	todos,
	onDelete,
	onToggle,
	onUpdate,
}: TodoListProps) {
  const key = useId();
	if (todos.length === 0) {
		return <p style={{ color: "#999" }}>No todos yet. Add one above!</p>;
	}

	return (
		<ul style={{ padding: 0, margin: 0 }}>
			{todos.map((todo: Todo) => (
				<TodoItem
					key={key}
					todo={todo}
					onDelete={onDelete}
					onToggle={onToggle}
					onUpdate={onUpdate}
				/>
			))}
		</ul>
	);
}

import { useId } from "react";
import type { Todo } from "../type";
import TodoItem from "./TodoItem";
