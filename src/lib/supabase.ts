import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Mismo proyecto Supabase que usa la app Flutter: ambas leen y escriben
// sobre la misma tabla `tasks`, demostrando un backend compartido.
const supabaseUrl = 'https://yafcbxeparxnrvqcrcqt.supabase.co';
const supabaseAnonKey = 'sb_publishable_uWZ7BQfOqviunj1BIqBQ6w_cob87IVR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
