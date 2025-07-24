import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFirestoreTasks, Task } from './FirestoreTaskContext';
import FAB from './FAB';
import TaskModal from './TaskModal';
import UserProfile from './components/UserProfile';


type FilterType = 'all' | 'open' | 'complete';

export default function TodoList() {
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTaskStatus } = useFirestoreTasks();
  const [modalVisible, setModalVisible] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  // Filtering and searching
  const filteredTasks = tasks.filter(task => {
    if (filter === 'open' && task.status !== 'open') return false;
    if (filter === 'complete' && task.status !== 'complete') return false;
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // No data state
  const showNoData = filteredTasks.length === 0;

  // Handlers
  const handleAdd = () => {
    setEditTask(null);
    setModalVisible(true);
  };
  const handleEdit = (task: Task) => {
    setEditTask(task);
    setModalVisible(true);
  };
  const handleSave = async (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editTask) {
        await updateTask(editTask.id, task);
      } else {
        await addTask(task);
      }
      setModalVisible(false);
      setEditTask(null);
    } catch (error: any) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error: any) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    }
  };

  const handleToggle = async (taskId: string) => {
    try {
      await toggleTaskStatus(taskId);
    } catch (error: any) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <UserProfile />
      <Text style={styles.today}>Today</Text>
      {/* Filters and Search */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterBtn, filter === 'all' && styles.selectedFilter]} onPress={() => setFilter('all')}><Text>All</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filter === 'open' && styles.selectedFilter]} onPress={() => setFilter('open')}><Text>Open</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filter === 'complete' && styles.selectedFilter]} onPress={() => setFilter('complete')}><Text>Complete</Text></TouchableOpacity>
        <TextInput
          placeholder="Search..."
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7DFF" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : showNoData ? (
        <View style={styles.noData}><Text>No tasks found.</Text></View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskRow}>
              <TouchableOpacity
                onPress={() => handleToggle(item.id)}
                style={[styles.circle, {
                  borderColor: item.status === 'complete' ? '#2ecc40' : '#2E7DFF',
                  backgroundColor: item.status === 'complete' ? '#2E7DFF' : '#fff',
                }]}
              >
                {item.status === 'complete' ? <View style={styles.innerCircle} /> : null}
              </TouchableOpacity>
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, item.status === 'complete' && styles.doneText]}>{item.title}</Text>
                {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
                <View style={styles.taskDetailsRow}>
                  {item.dueDate ? (
                    <View style={styles.dateTimeContainer}>
                      <Text style={styles.dateText}>
                        📅 {new Date(item.dueDate).toLocaleDateString()}
                      </Text>
                      <Text style={styles.timeText}>
                        🕐 {new Date(item.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noDateText}>No due date set</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}><Text style={styles.deleteText}>Delete</Text></TouchableOpacity>
            </View>
          )}
          style={styles.list}
        />
      )} 
      {/* FAB */}
      <FAB onPress={handleAdd} />
      {/* Modal */}
      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        initialTask={editTask || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
    marginRight: 4,
  },
  selectedFilter: {
    backgroundColor: '#2E7DFF',
    color: '#fff',
  },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    marginLeft: 8,
    backgroundColor: '#fff',
    height: 36,
  },
  noData: {
    marginTop: 40,
    alignItems: 'center',
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  desc: {
    color: '#666',
    fontSize: 15,
    marginBottom: 2,
  },
  editBtn: {
    marginLeft: 10,
    padding: 6,
    backgroundColor: '#e6f0ff',
    borderRadius: 8,
    alignSelf: 'center',
  },
  editText: {
    color: '#2E7DFF',
    fontWeight: 'bold',
  },
  deleteBtn: {
    marginLeft: 10,
    padding: 6,
    backgroundColor: '#ffeded',
    borderRadius: 8,
    alignSelf: 'center',
  },
  deleteText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
  },
  today: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
    marginLeft: 2,
    color: '#111',
  },
  list: {
    marginTop: 0,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    minHeight: 60,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'column',
  },
  taskTitle: {
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
    marginBottom: 2,
  },
  doneText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  taskDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  time: {
    color: '#6DC200',
    fontWeight: '600',
    marginRight: 8,
    fontSize: 14,
  },
  dateTimeContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  dateText: {
    color: '#2E7DFF',
    fontSize: 13,
    fontWeight: '500',
  },
  timeText: {
    color: '#6DC200',
    fontSize: 13,
    fontWeight: '500',
  },
  noDateText: {
    color: '#999',
    fontSize: 13,
    fontStyle: 'italic',
  },
  subtitle: {
    color: '#4F7FFF',
    fontWeight: '500',
    marginRight: 8,
    fontSize: 14,
  },
  category: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  work: {
    color: '#2E7DFF',
    backgroundColor: '#E8F0FE',
  },
  personal: {
    color: '#6DC200',
    backgroundColor: '#F1F8E9',
  },
});
