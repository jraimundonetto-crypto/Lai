// lib/supabaseClient.js
const supabaseUrl = 'https://xrwacdjyfimjrduyqrdy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyd2FjZGp5ZmltanJkdXlxcmR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODc5NDMsImV4cCI6MjA4NzM2Mzk0M30.GOnaC2SZr4fXQ9-n8OoeOGsDI2meTwSwR8_QgzKBtfg';

export async function getClient() {
    return new Promise((resolve) => {
        if (window.supabase) {
            resolve(window.supabase.createClient(supabaseUrl, supabaseKey));
        } else {
            const check = setInterval(() => {
                if (window.supabase) {
                    clearInterval(check);
                    resolve(window.supabase.createClient(supabaseUrl, supabaseKey));
                }
            }, 100);
        }
    });
}