import React, { useState } from 'react';
import { ShiftState } from '../wat/types';
import { Bot, Send, X } from 'lucide-react';

interface AgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  state: ShiftState;
  onSendMessage: (text: string) => void;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({
  isOpen,
  onClose,
  state,
  onSendMessage
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const quickQuestions = [
    "Comment parler aux boulangers ?",
    "Pourquoi recompter Diallo (25 vs 27) ?",
    "Règle pour le groupe Souridji ?",
    "Que faire à minuit ?",
    "Que dire au patron à son arrivée ?"
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    onSendMessage(text);
    setInputText('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: '460px',
      background: '#0d1322',
      borderLeft: '1px solid var(--border-active)',
      boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* En-tête du Drawer */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.9)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--amber-primary) 0%, var(--gold-glow) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)'
          }}>
            <Bot size={20} color="#000" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', color: '#fff' }}>Copilote IA PaniTrack</h3>
            <span style={{ fontSize: '11px', color: 'var(--success)' }}>● Surveillant Actif du Shift (WAT)</span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Zone des messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Messages */}
        {state.agentMessages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          const isAlert = msg.category === 'alerte';

          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isAgent ? 'flex-start' : 'flex-end',
                maxWidth: '90%',
                background: isAlert 
                  ? 'rgba(239, 68, 68, 0.15)' 
                  : isAgent 
                    ? 'rgba(18, 24, 38, 0.9)' 
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(180, 83, 9, 0.2) 100%)',
                border: isAlert 
                  ? '1px solid rgba(239, 68, 68, 0.4)' 
                  : isAgent 
                    ? '1px solid var(--border-subtle)' 
                    : '1px solid var(--border-active)',
                borderRadius: '14px',
                padding: '12px 14px',
                color: isAlert ? '#fca5a5' : 'var(--flour-white)',
                fontSize: '13.5px',
                lineHeight: '1.5'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px', color: 'var(--text-dim)' }}>
                <span style={{ fontWeight: 700, color: isAgent ? 'var(--amber-light)' : '#93c5fd' }}>
                  {isAgent ? (isAlert ? '🚨 ALERTE AGENT' : '🤖 Copilote') : '👤 Vous'}
                </span>
                <span>{msg.timestamp}</span>
              </div>
              <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>
            </div>
          );
        })}

      </div>

      {/* Suggestions rapides cliquables */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(15, 23, 42, 0.5)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px' }}>Questions fréquentes :</div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '11.5px',
                color: 'var(--amber-light)',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Saisie textuelle */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Posez une question sur le shift ou les règles..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          style={{ flex: 1, fontSize: '13.5px' }}
        />
        <button
          className="btn btn-primary"
          onClick={() => handleSend()}
          style={{ padding: '10px 14px' }}
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  );
};
