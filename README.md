# TaskAI · Mini-app React Native ⚡

Versión simplificada de **TaskAI** construida con **React Native + Expo** y
**TypeScript**. Su objetivo es demostrar que el **mismo backend Supabase** puede
servir simultáneamente a la app **Flutter** y a una app **React Native**: ambas
leen y escriben sobre la misma tabla `tasks`.

> App principal (Flutter): https://github.com/Tomjmp/task_ai

---

## ✨ Funcionalidades

- **Autenticación** con Supabase Auth (mismo backend que Flutter): login y
  registro con correo y contraseña.
- **Lista de tareas**: lee del backend las tareas del usuario autenticado,
  con pull-to-refresh y marcar como completada (actualización optimista).
- **Crear tarea**: formulario con título, descripción, categoría y prioridad;
  escribe en la misma tabla `tasks` que consume Flutter.
- **Navegación con Expo Router** (file-based) y **3 pantallas**.

---

## 🧭 Navegación (Expo Router)

```
src/app/
├── _layout.tsx       # Stack raíz + AuthProvider (contexto de sesión)
├── index.tsx         # Redirige según sesión: /login o /tasks
├── login.tsx         # Pantalla 1 · Login / Registro
└── tasks/
    ├── index.tsx     # Pantalla 2 · Lista de tareas
    └── new.tsx       # Pantalla 3 · Crear tarea (modal)
```

```
src/
├── lib/
│   ├── supabase.ts   # Cliente Supabase (con AsyncStorage)
│   ├── types.ts      # Tipos Task / categorías / prioridades
│   └── uuid.ts       # UUID v4 en el cliente (igual que Flutter)
└── contexts/
    └── auth.tsx      # Contexto de sesión (onAuthStateChange)
```

---

## 🛠️ Stack

- **Expo** (React Native) + **TypeScript** (modo `strict`, sin `any`).
- **Expo Router** para navegación basada en archivos.
- **@supabase/supabase-js** + **@react-native-async-storage/async-storage**
  para persistir la sesión.

---

## 🚀 Ejecución

```bash
npm install
npx expo start
```
Luego abre la app en **Expo Go** (escaneando el QR) o en un emulador:
```bash
npx expo start --android   # Android
npx expo start --ios       # iOS
npx expo start --web       # Navegador
```

> El proyecto Supabase ya está configurado en `src/lib/supabase.ts` (misma URL y
> *publishable key* que la app Flutter). Para probar el login, usa una cuenta ya
> creada en la app Flutter o regístrate desde la pantalla de login.

---

## ✅ Verificación de tipos

```bash
npx tsc --noEmit
```

---

## 🔗 Backend compartido

La tabla `tasks` en Supabase tiene las columnas: `id`, `user_id`, `title`,
`description`, `category`, `priority`, `completed`, `due_date`, `created_at`,
`updated_at`, `deleted_at`. Tanto Flutter como esta app usan ese mismo esquema,
por lo que una tarea creada en una aparece en la otra.
