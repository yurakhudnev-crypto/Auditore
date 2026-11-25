import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ndsrvrdzvqekokikgxhb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kc3ZyZGR6dnFla29raWtneGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNzc0NzIsImV4cCI6MjEwNjk1MzQ3Mn0.AHlnmrjFX-QEkufSBEm9M_RVmHtzKti8XWUQ2rUIpWw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
