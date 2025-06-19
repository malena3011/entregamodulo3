import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { create } from "zustand";
import styles from "./App.module.css";

// Zustand store
const useTodoStore = create((set) => ({
  todos: [],
  addTodo: (text) =>
    set((state) => ({
      todos: [
        ...state.todos,
        { id: Date.now(), text, completed: false, subtasks: [] },
      ],
    })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })),
  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),
  addSubtask: (todoId, subtaskText) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: [
                ...todo.subtasks,
                { id: Date.now(), text: subtaskText, done: false },
              ],
            }
          : todo
      ),
    })),
  toggleSubtask: (todoId, subtaskId) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, done: !subtask.done }
                  : subtask
              ),
            }
          : todo
      ),
    })),
}));

function useInput(initialValue = "") {
  const [value, setValue] = React.useState(initialValue);
  const onChange = (e) => setValue(e.target.value);
  const reset = () => setValue("");
  return { value, onChange, reset };
}

function TodoList() {
  const {
    todos,
    toggleTodo,
    deleteTodo,
    addSubtask,
    toggleSubtask,
  } = useTodoStore();
  const [expandedId, setExpandedId] = useState(null);
  const [subtaskInputs, setSubtaskInputs] = useState({});

  const handleSubInputChange = (todoId, e) => {
    setSubtaskInputs((prev) => ({ ...prev, [todoId]: e.target.value }));
  };

  const handleAddSubtask = (e, todoId) => {
    e.preventDefault();
    const input = subtaskInputs[todoId];
    if (!input?.trim()) return;
    addSubtask(todoId, input.trim());
    setSubtaskInputs((prev) => ({ ...prev, [todoId]: "" }));
  };

  return (
    <div className={styles.todoList}>
      {todos.map((todo) => {
        const isExpanded = expandedId === todo.id;

        return (
          <div key={todo.id} className={styles.todoItem}>
            <span
              className={`${styles.todoText} ${
                todo.completed ? styles.completed : ""
              }`}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.text}
            </span>
            <div>
              <button
                className={styles.detailsButton}
                onClick={() => setExpandedId(isExpanded ? null : todo.id)}
              >
                {isExpanded ? "Ocultar" : "Detalles"}
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => deleteTodo(todo.id)}
              >
                Eliminar
              </button>
            </div>

            {isExpanded && (
              <div className={styles.subtaskContainer}>
                <form onSubmit={(e) => handleAddSubtask(e, todo.id)}>
                  <input
                    className={styles.inputField}
                    placeholder="Nueva subtarea"
                    value={subtaskInputs[todo.id] || ""}
                    onChange={(e) => handleSubInputChange(todo.id, e)}
                  />
                </form>
                <ul className={styles.subtaskList}>
                  {todo.subtasks?.map((sub) => (
                    <li
                      key={sub.id}
                      className={sub.done ? styles.completed : ""}
                      onClick={() => toggleSubtask(todo.id, sub.id)}
                    >
                      - {sub.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AddTodo() {
  const { addTodo } = useTodoStore();
  const input = useInput();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.value.trim()) return;
    addTodo(input.value);
    input.reset();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.addForm}>
      <input
        className={styles.inputField}
        placeholder="Nueva tarea"
        value={input.value}
        onChange={input.onChange}
      />
    </form>
  );
}

function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Lista de Tareas</h1>
      <AddTodo />
      <TodoList />
    </div>
  );
}

function About() {
  return (
    <div className={styles.container}>
      <h2 className={styles.subtitle}>Contactanos</h2>
      <p>Podes comunicarte con nosotros al instagram @malen4villalba</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link to="/">Inicio</Link>
          <Link to="/about">Contacto</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}
