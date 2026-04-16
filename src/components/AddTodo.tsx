import { type FormEvent, useRef } from "react"

export default function AddTodo({ onAdd }: { onAdd: (text: string) => void }) {
  const inputRef = useRef(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (inputRef.current) {
    onAdd(inputRef.current.value)
    inputRef.current.value = ""
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: "8px", marginBottom: "16px" }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="What needs to be done?"
        style={{ flex: 1, padding: "8px" }}
      />
      <button type="submit">Add</button>
    </form>
  )
}

