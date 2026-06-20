import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import {
  CATEGORY_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  TaskCategory,
  TaskPriority,
} from '@/lib/types';
import { uuidv4 } from '@/lib/uuid';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TaskCategory[];
const PRIORITIES = Object.keys(PRIORITY_LABELS) as TaskPriority[];

export default function NewTaskScreen() {
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (!session) {
      setError('No hay sesión activa.');
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();
    try {
      // Mismas columnas que escribe la app Flutter en la tabla `tasks`.
      const { error: insertError } = await supabase.from('tasks').insert({
        id: uuidv4(),
        user_id: session.user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        completed: false,
        due_date: now,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      });
      if (insertError) throw insertError;
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la tarea.');
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Nueva Tarea</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>TÍTULO</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Preparar presentación final"
          placeholderTextColor="#CBD5E1"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>DESCRIPCIÓN</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción opcional..."
          placeholderTextColor="#CBD5E1"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>CATEGORÍA</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.chip, category === c && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  category === c && styles.chipTextActive,
                ]}
              >
                {CATEGORY_LABELS[c]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>PRIORIDAD</Text>
        <View style={styles.chipRow}>
          {PRIORITIES.map((p) => {
            const active = priority === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.priorityChip,
                  active && {
                    borderColor: PRIORITY_COLORS[p],
                    backgroundColor: `${PRIORITY_COLORS[p]}1A`,
                  },
                ]}
              >
                <View
                  style={[styles.dot, { backgroundColor: PRIORITY_COLORS[p] }]}
                />
                <Text
                  style={[
                    styles.priorityText,
                    active && { color: PRIORITY_COLORS[p], fontWeight: '700' },
                  ]}
                >
                  {PRIORITY_LABELS[p]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={save}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Guardar Tarea</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 16, color: '#0F172A' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  form: { padding: 20 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  chipActive: { backgroundColor: '#7C5CFF' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  priorityText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  error: { color: '#EF4444', fontSize: 13, marginTop: 16, textAlign: 'center' },
  saveBtn: {
    backgroundColor: '#7C5CFF',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
