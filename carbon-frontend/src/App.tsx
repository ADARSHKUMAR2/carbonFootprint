import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import CarbonChat from './components/carbonChat';
import Auth from './components/Auth';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      console.log('✅ Initial session:', session);
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      console.log('✅ Auth state changed:', _event, 'Session:', session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Personal Carbon Footprint Tracker</h1>
          <p className="text-gray-500 mt-2">Log your daily activities and get AI-driven reduction strategies.</p>
          
          {/* Logout Button (Only shows if logged in) */}
          {session && (
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="mt-4 text-sm text-red-600 hover:underline"
            >
              Sign Out
            </button>
          )}
        </div>
        
        {!session ? <Auth /> : <CarbonChat sessionToken={session.access_token} />}
        
      </div>
    </div>
  );
}

export default App;