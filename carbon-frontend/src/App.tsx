import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import Auth from './components/Auth';
import CarbonFootprintCalculator from './components/CarbonFootprintCalculator';

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
        <header className="flex justify-between items-center py-4 px-6 bg-white shadow-md rounded-lg">
          <h1 className="text-xl font-bold text-gray-800">Carbon Footprint Tracker</h1>
          {session && (
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="text-sm text-red-600 hover:underline"
            >
              Sign Out
            </button>
          )}
        </header>

        <div className="text-center py-8 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md">
          <h2 className="text-4xl font-extrabold mb-2">Track Your Impact</h2>
          <p className="text-lg">Log daily activities and get AI-driven reduction strategies.</p>
        </div>
        
        {!session ? <Auth /> : <CarbonFootprintCalculator />}
        
      </div>
    </div>
  );
}

export default App;