import { useState } from "react";
import type { Todo } from "../type";

interface TodoItemProps {
	todo: Todo;
	onDelete: (id: string | number) => void;
	onToggle: (id: string | number) => void;
	onUpdate: (id: string | number, text: string) => void;
}

export default function TodoItem({
	todo,
	onDelete,
	onToggle,
	onUpdate,
}: TodoItemProps) {
	const [isEditing, setIsEditing] = useState(false);

	const [editText, setEditText] = useState(todo.name);

	const isCompleted = todo.completed || todo.done || todo.isDone;

	const displayText =  todo.name;

	const handleSave = () => {
		onUpdate(todo.id, editText);
		setIsEditing(false);
	};

	return (
		<li
			style={{
				display: "flex",
				alignItems: "center",
				gap: "8px",
				padding: "8px 0",
				borderBottom: "1px solid #eee",
				listStyle: "none",
				textDecoration: isCompleted ? "line-through" : "none",
				opacity: isCompleted ? 0.5 : 1,
			}}
		>
			<input
				type="checkbox"
				checked={!!isCompleted}
				onChange={() => onToggle(todo.id)}
			/>

			{isEditing ? (
				<>
					<input
						value={editText}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setEditText(e.target.value)
						}
						style={{ flex: 1, padding: "4px" }}
					/>
					<button onClick={handleSave} type="button">
						Save
					</button>
					<button onClick={() => setIsEditing(false)} type="button">
						Cancel
					</button>
				</>
			) : (
				<>
					<span style={{ flex: 1 }}>{displayText}</span>
					<button onClick={() => setIsEditing(true)} type="button">
						Edit
					</button>
					<button onClick={() => onDelete(todo.id)} type="button">
						Delete
					</button>
				</>
			)}
		</li>
	);
}
