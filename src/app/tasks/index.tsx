import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import {
  CATEGORY_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  Task,
} from '@/lib/types';

export default function TasksScreen() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!session) return;
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .order('due_date', { ascending: true });

      if (queryError) throw queryError;
      setTasks((data ?? []) as Task[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las tareas.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Recargar al volver a esta pantalla (p. ej. tras crear una tarea).
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadTasks();
    }, [loadTasks]),
  );

  async function toggleComplete(task: Task) {
    // Actualización optimista en la UI.
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t,
      ),
    );
    await supabase
      .from('tasks')
      .update({
        completed: !task.completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const completed = tasks.filter((t) => t.completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola,</Text>
          <Text style={styles.email}>{session?.user.email ?? 'Usuario'}</Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Tu progreso</Text>
        <Text style={styles.progressValue}>
          {completed} de {tasks.length} tareas completadas
        </Text>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Mis Tareas</Text>
        <Text style={styles.listCount}>{tasks.length}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C5CFF" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={loadTasks} style={styles.retryBtn}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={loadTasks} tintColor="#7C5CFF" />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              No tienes tareas todavía. Crea la primera con el botón +.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.taskCard}
              onPress={() => toggleComplete(item)}
            >
              <View
                style={[
                  styles.priorityBar,
                  { backgroundColor: PRIORITY_COLORS[item.priority] },
                ]}
              />
              <View style={styles.taskInfo}>
                <Text
                  style={[
                    styles.taskTitle,
                    item.completed && styles.taskTitleDone,
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.taskMeta}>
                  {CATEGORY_LABELS[item.category]} · {PRIORITY_LABELS[item.priority]}
                </Text>
              </View>
              <View
                style={[styles.check, item.completed && styles.checkDone]}
              >
                {item.completed && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </Pressable>
          )}
        />
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/tasks/new')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  greeting: { fontSize: 13, color: '#64748B' },
  email: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  logoutText: { color: '#475569', fontWeight: '600', fontSize: 13 },
  progressCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#7C5CFF',
  },
  progressLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  progressValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  listCount: { fontSize: 13, color: '#7C5CFF', fontWeight: '700' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: '#EF4444', textAlign: 'center', marginBottom: 12 },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#7C5CFF',
    borderRadius: 12,
  },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
  empty: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 40,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  priorityBar: { width: 4, height: 40, borderRadius: 4, marginRight: 14 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskMeta: { fontSize: 12, color: '#64748B', marginTop: 4 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: '#7C5CFF', borderColor: '#7C5CFF' },
  checkMark: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 36,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C5CFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C5CFF',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: '#FFFFFF', fontSize: 30, fontWeight: '300', lineHeight: 34 },
});
