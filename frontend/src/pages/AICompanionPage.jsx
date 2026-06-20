import { useState, useRef, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { aiApi } from '../api/aiApi';

export default function AICompanionPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    aiApi.getSuggestedQuestions()
      .then(res => setSuggested(res.data?.data || []))
      .catch((err) => console.error("Failed to load suggested questions:", err));

    aiApi.getHistory()
      .then(async (res) => {
        const sessions = res.data?.data || [];
        if (sessions.length > 0) {
          const latestSessionId = sessions[0].session_id;
          setSessionId(latestSessionId);
          try {
            const historyRes = await aiApi.getSessionHistory(latestSessionId);
            if (historyRes.data?.success) {
              setMessages(historyRes.data.data || []);
            }
          } catch (err) {
            console.error("Failed to load session messages:", err);
          }
        }
      })
      .catch((err) => console.error("Failed to load chat history:", err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiApi.chat({ message: text, sessionId });
      if (data.success) {
        setSessionId(data.data.sessionId);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.data.message.content, 
          id: data.data.message.id || (Date.now() + 1) 
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error communicating with the AI server. Please verify OpenAI keys and try again.', 
        id: Date.now() + 1 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    setGeneratedQuestions('');
    try {
      const res = await aiApi.generateQuestions();
      if (res.data?.success) {
        setGeneratedQuestions(res.data.data.questions);
        // Automatically inject as an assistant response to keep the chat context flowing!
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `📋 **DocBridge generated questions for your next doctor visit:**\n\n${res.data.data.questions}`,
          id: Date.now()
        }]);
      }
    } catch (err) {
      console.error("Failed to generate questions:", err);
      alert("Failed to generate doctor questions. Please check OpenAI service configuration.");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleClearChat = async () => {
    if (sessionId) {
      try {
        await aiApi.deleteSession(sessionId);
      } catch (err) {
        console.error("Failed to clear backend session:", err);
      }
    }
    setMessages([]);
    setSessionId(null);
    setGeneratedQuestions('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-130px)] flex flex-col space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            🤖 AI Health Companion
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Ask questions about your diagnoses, medicines, and labs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleGenerateQuestions}
            loading={generatingQuestions}
            className="text-xs py-2 border border-teal-500/20 text-teal-300 hover:bg-teal-500/10"
          >
            📋 Generate Doctor Questions
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleClearChat}
            className="text-xs py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Main Chat Box */}
      <Card className="flex-1 flex flex-col overflow-hidden !p-0 bg-slate-900/50 border border-white/5 backdrop-blur-xl rounded-2xl">
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-4xl shadow-xl shadow-teal-500/10 mb-6">
                🤖
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-2">Welcome to your DocBridge AI Companion</h3>
              <p className="text-sm text-slate-400 max-w-md mb-8">
                I analyze your logged medications, symptoms, and blood work to help answer your queries in plain, non-jargon terms.
              </p>
              
              {/* Clickable Suggested Prompt Chips */}
              <div className="space-y-3 w-full max-w-lg">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Suggested Starter Questions</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {(suggested.length > 0 ? suggested : [
                    "Explain my active prescriptions in simple words.",
                    "Are any of my logged symptoms concerning?",
                    "What questions should I ask my doctor about my diagnosis?",
                    "Analyze my recent blood test biomarker values."
                  ]).slice(0, 4).map((q, i) => (
                    <button 
                      key={i} 
                      onClick={() => sendMessage(q)} 
                      className="text-left text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-slate-300 hover:text-teal-300 hover:border-teal-500/30 transition-all leading-normal"
                    >
                      💡 {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-md leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                    : 'bg-white/5 border border-white/5 text-slate-200 text-sm whitespace-pre-wrap'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/5 rounded-2xl px-5 py-4 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDuration: '0.8s' }} />
                <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.15s' }} />
                <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Form input footer */}
        <div className="border-t border-white/5 p-4 bg-slate-950/40">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything about your health (e.g. Can you explain Lipitor?)..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
              disabled={loading}
            />
            <Button 
              type="submit" 
              loading={loading} 
              disabled={!input.trim()}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
