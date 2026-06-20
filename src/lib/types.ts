// Espejo del modelo Task de la app Flutter (mismas columnas en Supabase).
export type TaskCategory = 'trabajo' | 'personal' | 'estudio' | 'urgente';
export type TaskPriority = 'alta' | 'media' | 'baja';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  due_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  trabajo: '💼 Trabajo',
  personal: '🙂 Personal',
  estudio: '🎓 Estudio',
  urgente: '⚡ Urgente',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  alta: '#EF4444',
  media: '#F59E0B',
  baja: '#10B981',
};
