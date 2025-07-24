import React, { createContext, useContext, useState } from 'react';

export type TaskStatus = 'open' | 'complete';
export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  status: TaskStatus;
};

type TaskContextType = {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  clearTasks: () => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Omit<Task, 'id'>) => {
    setTasks(prev => [
      ...prev,
      {
        ...task,
        id: Math.random().toString(36).slice(2) + Date.now(),
      },
    ]);
  };

  const updateTask = (id: string, task: Partial<Omit<Task, 'id'>>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...task } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: t.status === 'open' ? 'complete' : 'open' } : t))
    );
  };

  const clearTasks = () => setTasks([]);

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, toggleTaskStatus, clearTasks }}>
      {children}
    </TaskContext.Provider>
  );
};
