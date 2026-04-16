interface TodoListProps {
  todos: Todo[]
  onDelete: (id: number) => void
  onToggle: (id: number) => void
  onUpdate: (id: number, text: string) => void
}

export default function TodoList({ todos, onDelete, onToggle, onUpdate }: TodoListProps) {
  if (todos.length === 0) {
    return <p style={{ color: "#999" }}>No todos yet. Add one above!</p>
  }

  return (
    <ul style={{ padding: 0, margin: 0 }}>
      {todos.map((todo: any, index: any) => (
        <TodoItem
          key={index}
          todo={todo}
          onDelete={onDelete}
          onToggle={onToggle}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  )
}

import TodoItem from "./TodoItem"

