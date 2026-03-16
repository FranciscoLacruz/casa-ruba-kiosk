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

export function useElevenLabs() {
  const [status, setStatus] = useState(ConversationStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const conversationRef = useRef(null);

  const startConversation = useCallback(async (agentId) => {
    // Detectar si el agentId es un placeholder sin configurar
    if (!agentId || PLACEHOLDER_IDS.includes(agentId)) {
      setErrorMessage('convErrorPlaceholder');
      setStatus(ConversationStatus.ERROR);
      return;
    }

    setStatus(ConversationStatus.CONNECTING);
    setErrorMessage(null);

    try {
      // Solicitar permiso de micrófono explícitamente
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const conversation = await Conversation.startSession({
        agentId,
        onConnect: () => {
          setStatus(ConversationStatus.LISTENING);
        },
        onDisconnect: (details) => {
          if (details?.reason === 'error') {
            setErrorMessage('convError');
            setStatus(ConversationStatus.ERROR);
          } else {
            setStatus(ConversationStatus.IDLE);
          }
          conversationRef.current = null;
        },
        onError: (message, context) => {
          console.error('[ElevenLabs] Error:', message, context);
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
    if (conversationRef.current) {
      try {
        await conversationRef.current.endSession();
      } catch (err) {
        console.error('[ElevenLabs] endSession error:', err);
      }
      conversationRef.current = null;
    }
    setStatus(ConversationStatus.IDLE);
    setErrorMessage(null);
  }, []);

  return { status, errorMessage, startConversation, endConversation };
}
