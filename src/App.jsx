import { useState, useEffect, useCallback, useRef } from 'react';
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
  const idleTimerRef = useRef(null);

  const irAIdle = useCallback(() => {
    setScreen(SCREENS.IDLE);
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    if (screen !== SCREENS.IDLE) {
      idleTimerRef.current = setTimeout(irAIdle, IDLE_TIMEOUT_SECONDS * 1000);
    }
  }, [screen, irAIdle]);

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

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {screen === SCREENS.IDLE && (
        <IdleScreen onTouch={() => setScreen(SCREENS.LANGUAGE)} />
      )}
      {screen === SCREENS.LANGUAGE && (
        <LanguageScreen
          onSelectLanguage={(lang) => {
            setLanguage(lang);
            setScreen(SCREENS.CONVERSATION);
          }}
          onBack={irAIdle}
        />
      )}
      {screen === SCREENS.CONVERSATION && (
        <ConversationScreen language={language} onEnd={irAIdle} />
      )}
    </div>
  );
}
