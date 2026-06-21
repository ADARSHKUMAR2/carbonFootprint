import { type FormEvent, useState, type ReactElement } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { Send, Loader2, Leaf } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function CarbonChat({ sessionToken }: { sessionToken: string }): ReactElement {
  const [inputText, setInputText] = useState('');

  console.log('🔐 CarbonChat sessionToken:', sessionToken);

  if (!sessionToken) {
    return <div className="p-8 text-center text-gray-500">Session token not available. Please log in again.</div>;
  }

  const transport = new TextStreamChatTransport({
    api: `${import.meta.env.VITE_API_BASE_URL}/carbon/stream`,
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  const { messages = [], sendMessage, isLoading } = useChat({
    id: sessionToken,
    transport,
    onError: (err: any) => {
      console.error('🚨 AI SDK ERROR CAUGHT:', err?.message ?? err);
      alert(`Backend Error: ${err?.message ?? 'Unknown error'}`);
    }
  } as any) as any;

  // Form submission using sendMessage()
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    await sendMessage({ text: trimmed });
    
    setInputText('');
  };

  const renderMessageContent = (content: string, role: string) => {
    if (role === 'user') return <p>{content}</p>;

    try {
      const data = JSON.parse(content);
      const chartData = Object.entries(data.category_breakdown || {})
        .map(([name, value]) => ({ name, value: Number(value) }))
        .filter(item => item.value > 0);

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
            <h3 className="font-bold text-blue-800 text-lg mb-1">
              Total Footprint: <span className="text-2xl">{data.total_co2_kg} kg</span>
            </h3>
            <p className="text-blue-900 text-sm">{data.summary_message}</p>
          </div>

          {chartData.length > 0 && (
            <div className="h-64 w-full bg-white rounded-lg border p-4">
              <h4 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Emission Sources</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${value} kg CO2e`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-lg border p-4">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" /> Action Plan
            </h4>
            <ul className="space-y-2">
              {(data.personalized_action_plan || []).map((step: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    } catch {
      return (
        <div className="flex items-center gap-3 text-gray-500 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Analyzing carbon metrics...</p>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-[750px] w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 text-center font-bold text-lg tracking-wide shadow-md">AI Carbon Coach</div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 scroll-smooth">
        {messages?.map((m: any) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white rounded-xl rounded-br-none p-4 shadow-md' : 'w-full'}`}>
              {renderMessageContent(m.content, m.role)}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200 flex items-center gap-3 shadow-inner">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="E.g., I drove 50 miles today and ate a burger..."
          className="flex-1 px-5 py-3 bg-gray-100 border border-gray-300 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 ease-in-out text-gray-800 placeholder-gray-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors duration-200 ease-in-out flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}