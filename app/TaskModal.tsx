import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import { Task, TaskStatus } from './FirestoreTaskContext';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  initialTask?: Partial<Task>;
}

export default function TaskModal({ visible, onClose, onSave, initialTask }: TaskModalProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [dueDate, setDueDate] = useState<Date | null>(initialTask?.dueDate || null);
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || 'open');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);

  useEffect(() => {
    setTitle(initialTask?.title || '');
    setDescription(initialTask?.description || '');
    setDueDate(initialTask?.dueDate || null);
    setStatus(initialTask?.status || 'open');
  }, [visible, initialTask]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, description, dueDate, status });
    onClose();
  };

  const handleDatePress = () => {
    setPickerMode('date');
    setShowDatePicker(true);
  };

  const handleCalendarDayPress = (day: any) => {
    // day: {dateString: '2025-07-25', day: 25, month: 7, year: 2025, timestamp: 1753353600000}
    const base = dueDate || new Date();
    const [year, month, date] = day.dateString.split('-').map(Number);
    const newDate = new Date(base);
    newDate.setFullYear(year, month - 1, date);
    setCalendarDate(newDate);
    // Set the date immediately with current time or default time
    setDueDate(newDate);
    setPickerMode('time');
  };

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    if (selectedTime && calendarDate) {
      const newDate = new Date(calendarDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDueDate(newDate);
    }
    setShowDatePicker(false);
    setPickerMode('date');
    setCalendarDate(null);
  };

  const handleSkipTime = () => {
    // Keep the date that was already set when calendar date was selected
    setShowDatePicker(false);
    setPickerMode('date');
    setCalendarDate(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.header}>{initialTask ? 'Edit Task' : 'Add Task'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity onPress={handleDatePress} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>{dueDate ? dueDate.toLocaleString() : 'Set Due Date & Time'}</Text>
          </TouchableOpacity>
          {showDatePicker && pickerMode === 'date' && (
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={handleCalendarDayPress}
                markedDates={calendarDate ? { [calendarDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#2E7DFF' } } : {}}
                current={calendarDate ? calendarDate.toISOString().split('T')[0] : undefined}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#b6c1cd',
                  selectedDayBackgroundColor: '#2E7DFF',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#2E7DFF',
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#d9e1e8',
                  dotColor: '#00adf5',
                  selectedDotColor: '#ffffff',
                  arrowColor: '#2E7DFF',
                  disabledArrowColor: '#d9e1e8',
                  monthTextColor: '#2d4150',
                  indicatorColor: '#2E7DFF',
                  textDayFontWeight: '300',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '300',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 13
                }}
              />
            </View>
          )}
          {showDatePicker && pickerMode === 'time' && (
            <View>
              <Text style={styles.timePickerLabel}>Select Time (Optional)</Text>
              <DateTimePicker
                value={calendarDate || dueDate || new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
              <TouchableOpacity onPress={handleSkipTime} style={styles.skipTimeButton}>
                <Text style={styles.skipTimeText}>Skip Time - Keep Date Only</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.statusRow}>
            <TouchableOpacity onPress={() => setStatus('open')} style={[styles.statusBtn, status === 'open' && styles.selectedStatus]}>
              <Text style={styles.statusText}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStatus('complete')} style={[styles.statusBtn, status === 'complete' && styles.selectedStatus]}>
              <Text style={styles.statusText}>Complete</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    elevation: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2E7DFF',
    fontWeight: '500',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statusBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedStatus: {
    backgroundColor: '#e0e0e0',
    borderColor: '#333',
  },
  statusText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  cancelBtn: {
    padding: 10,
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
  },
  saveBtn: {
    padding: 10,
    backgroundColor: '#2E7DFF',
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  skipTimeButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  skipTimeText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});
