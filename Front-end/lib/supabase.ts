import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbeccibjkvwpvpoozyhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZWNjaWJqa3Z3cHZwb296eWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTM1NzksImV4cCI6MjA2NDUyOTU3OX0.BPZYlakbyKizt8GOchUkSBT-EnC1RgSFUfe4vb2etyo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 