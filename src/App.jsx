import { useState, useEffect, useCallback } from 'react';
import IdleScreen from './screens/IdleScreen';
import LanguageScreen from './screens/LanguageScreen';
import ConversationScreen from './screens/ConversationScreen';
import { IDLE_TIMEOUT_SECONDS } from './config/agents';

const SCREENS = {
  IDLE: 'IDLE',
  LANGUAGE: 'LANGUAGE',
  CONVERSATION: 'CONVERSATION',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.IDLE);
  const [language, setLanguage] = useState('es');
  const idleTimerRef = { current: null };

  const irAIdle = useCallback(() => {
    setScreen(SCREENS.IDLE);
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    if (screen !== SCREENS.IDLE) {
      idleTimerRef.current = setTimeout(irAIdle, IDLE_TIMEOUT_SECONDS * 1000);
    }
  }, [screen, irAIdle]);

  // Reiniciar timer en cada actividad del usuario
  useEffect(() => {
    if (screen === SCREENS.IDLE) return;

    const eventos = ['touchstart', 'touchmove', 'mousedown', 'mousemove', 'keydown'];
    eventos.forEach((e) => window.addEventListener(e, resetIdleTimer, { passive: true }));

    resetIdleTimer();

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      clearTimeout(idleTimerRef.current);
    };
  }, [screen, resetIdleTimer]);

  function handleTouchIdle() {
    setScreen(SCREENS.LANGUAGE);
  }

  function handleSelectLanguage(lang) {
    setLanguage(lang);
    setScreen(SCREENS.CONVERSATION);
  }

  function handleEndConversation() {
    setScreen(SCREENS.IDLE);
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {screen === SCREENS.IDLE && (
        <IdleScreen onTouch={handleTouchIdle} />
      )}
      {screen === SCREENS.LANGUAGE && (
        <LanguageScreen onSelectLanguage={handleSelectLanguage} onBack={irAIdle} />
      )}
      {screen === SCREENS.CONVERSATION && (
        <ConversationScreen language={language} onEnd={handleEndConversation} />
      )}
    </div>
  );
}
