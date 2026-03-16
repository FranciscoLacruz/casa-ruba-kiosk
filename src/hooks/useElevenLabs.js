import { useState, useRef, useCallback } from 'react';
import { Conversation } from '@elevenlabs/client';
import { PLACEHOLDER_IDS } from '../config/agents';

export const ConversationStatus = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING',
  LISTENING: 'LISTENING',
  SPEAKING: 'SPEAKING',
  ERROR: 'ERROR',
};

const IS_MOCK = import.meta.env.VITE_MOCK_ELEVENLABS === 'true';

export function useElevenLabs() {
  const [status, setStatus] = useState(ConversationStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const conversationRef = useRef(null);
  const mockTimersRef = useRef([]);

  const startConversation = useCallback(async (agentId) => {
    if (conversationRef.current) return;

    if (!agentId || PLACEHOLDER_IDS.includes(agentId)) {
      setErrorMessage('convErrorPlaceholder');
      setStatus(ConversationStatus.ERROR);
      return;
    }

    setStatus(ConversationStatus.CONNECTING);
    setErrorMessage(null);

    if (IS_MOCK) {
      // Simular ciclo completo sin llamar a ElevenLabs
      conversationRef.current = '__mock__';
      const t1 = setTimeout(() => {
        setStatus(ConversationStatus.LISTENING);
        const cycle = () => {
          const t2 = setTimeout(() => {
            setStatus(ConversationStatus.SPEAKING);
            const t3 = setTimeout(() => {
              setStatus(ConversationStatus.LISTENING);
              cycle();
            }, 2500);
            mockTimersRef.current.push(t3);
          }, 3000);
          mockTimersRef.current.push(t2);
        };
        cycle();
      }, 1000);
      mockTimersRef.current.push(t1);
      return;
    }

    try {
      const conversation = await Conversation.startSession({
        agentId,
        connectionType: 'websocket',
        workletPaths: {
          rawAudioProcessor: '/worklets/rawAudioProcessor.js',
          audioConcatProcessor: '/worklets/audioConcatProcessor.js',
        },
        onConnect: () => {
          setStatus(ConversationStatus.LISTENING);
        },
        onDisconnect: (details) => {
          console.log('[ElevenLabs] onDisconnect:', JSON.stringify(details));
          if (details?.reason === 'error') {
            setErrorMessage('convError');
            setStatus(ConversationStatus.ERROR);
          } else {
            setStatus(ConversationStatus.IDLE);
          }
          conversationRef.current = null;
        },
        onError: (message, context) => {
          console.error('[ElevenLabs] onError:', message, JSON.stringify(context));
          setErrorMessage('convError');
          setStatus(ConversationStatus.ERROR);
          conversationRef.current = null;
        },
        onModeChange: ({ mode }) => {
          if (mode === 'speaking') {
            setStatus(ConversationStatus.SPEAKING);
          } else if (mode === 'listening') {
            setStatus(ConversationStatus.LISTENING);
          }
        },
      });

      conversationRef.current = conversation;
    } catch (err) {
      console.error('[ElevenLabs] startSession error:', err);
      setErrorMessage('convError');
      setStatus(ConversationStatus.ERROR);
    }
  }, []);

  const endConversation = useCallback(async () => {
    // Limpiar timers del mock
    mockTimersRef.current.forEach(clearTimeout);
    mockTimersRef.current = [];

    if (conversationRef.current && conversationRef.current !== '__mock__') {
      try {
        await conversationRef.current.endSession();
      } catch (err) {
        console.error('[ElevenLabs] endSession error:', err);
      }
    }
    conversationRef.current = null;
    setStatus(ConversationStatus.IDLE);
    setErrorMessage(null);
  }, []);

  return { status, errorMessage, startConversation, endConversation, isMock: IS_MOCK };
}
