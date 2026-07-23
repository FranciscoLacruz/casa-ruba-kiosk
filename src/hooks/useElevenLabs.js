import { useState, useRef, useCallback } from 'react';
import { Conversation } from '@elevenlabs/client';
import { PLACEHOLDER_IDS, getAgentId } from '../config/agents';

export const ConversationStatus = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING',
  LISTENING: 'LISTENING',
  SPEAKING: 'SPEAKING',
  ERROR: 'ERROR',
};

const IS_MOCK = import.meta.env.VITE_MOCK_ELEVENLABS === 'true';

function klog(msg) {
  console.log('[ElevenLabs]', msg);
  if (window.electron?.log) window.electron.log('ElevenLabs', msg);
}

export function useElevenLabs({ onClientToolCall } = {}) {
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
    klog(`Iniciando conexión con agentId=${agentId} mock=${IS_MOCK}`);

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
      const now = new Date();
      const hourMadrid = parseInt(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Madrid',
          hour: '2-digit',
          hour12: false,
        }).format(now),
        10
      );

      const conversation = await Conversation.startSession({
        agentId,
        connectionType: 'websocket',
        dynamicVariables: {
          hora_local_actual: hourMadrid,
          es_antes_de_15: hourMadrid < 15,
        },
        clientTools: {
          obtener_direcciones_hotel: async (parameters) => {
            klog('Client tool invocado: obtener_direcciones_hotel');
            onClientToolCall?.('obtener_direcciones_hotel', parameters);
            return 'Mapa de direcciones mostrado en pantalla';
          },
          mostrar_qr_reserva: async (parameters) => {
            klog('Client tool invocado: mostrar_qr_reserva');
            onClientToolCall?.('mostrar_qr_reserva', parameters);
            return 'QR de reservas mostrado en pantalla';
          },
          finalizar_conversacion: async (parameters) => {
            klog('Client tool invocado: finalizar_conversacion');
            onClientToolCall?.('finalizar_conversacion', parameters);
            return 'Conversación finalizada por el asistente';
          },
        },
        onConnect: () => {
          klog('Conectado');
          setStatus(ConversationStatus.LISTENING);
        },
        onDisconnect: (details) => {
          klog(`Desconectado: ${JSON.stringify(details)}`);
          if (details?.reason === 'error') {
            setErrorMessage('convError');
            setStatus(ConversationStatus.ERROR);
          } else {
            setStatus(ConversationStatus.IDLE);
          }
          conversationRef.current = null;
        },
        onError: (message, context) => {
          klog(`Error: ${message} ${JSON.stringify(context)}`);
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
      klog(`startSession error: ${err.message || err}`);
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
