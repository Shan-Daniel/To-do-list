import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useAuth } from './AuthContext';

export type TaskStatus = 'open' | 'complete';

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  status: TaskStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type TaskContextType = {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  clearTasks: () => Promise<void>;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useFirestoreTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useFirestoreTasks must be used within FirestoreTaskProvider');
  return ctx;
};

export const FirestoreTaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Real-time listener for user's tasks
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, 'tasks');
    // Simple query without orderBy to avoid composite index requirement
    const q = query(
      tasksRef,
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Firestore snapshot received, docs count:', snapshot.size);
      const userTasks: Task[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Processing task doc:', doc.id, data);
        
        try {
          userTasks.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            dueDate: data.dueDate ? data.dueDate.toDate() : null,
            status: data.status || 'open',
            userId: data.userId,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
          });
        } catch (docError) {
          console.error('Error processing task document:', doc.id, docError);
        }
      });
      
      // Sort tasks by createdAt in memory (newest first)
      userTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('Setting tasks:', userTasks.length, 'tasks');
      setTasks(userTasks);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tasks:', error);
      // Try to get more specific error info
      if (error.code === 'failed-precondition') {
        console.error('Firestore index may be missing. Check Firebase Console.');
      }
      setTasks([]);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addTask = async (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User must be authenticated to add tasks');

    const now = Timestamp.now();
    const taskData = {
      ...task,
      dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await addDoc(collection(db, 'tasks'), taskData);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, task: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!user) throw new Error('User must be authenticated to update tasks');

    const taskRef = doc(db, 'tasks', id);
    const updateData: any = {
      ...task,
      updatedAt: Timestamp.now(),
    };

    // Convert dueDate to Timestamp if provided
    if (task.dueDate !== undefined) {
      updateData.dueDate = task.dueDate ? Timestamp.fromDate(task.dueDate) : null;
    }

    try {
      await updateDoc(taskRef, updateData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) throw new Error('User must be authenticated to delete tasks');

    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus: TaskStatus = task.status === 'open' ? 'complete' : 'open';
    await updateTask(id, { status: newStatus });
  };

  const clearTasks = async () => {
    if (!user) throw new Error('User must be authenticated to clear tasks');

    try {
      // Delete all user's tasks
      const deletePromises = tasks.map(task => deleteTask(task.id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing tasks:', error);
      throw error;
    }
  };

  const value = {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    clearTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
