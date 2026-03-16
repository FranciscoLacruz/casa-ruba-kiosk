// ⚠️  PENDIENTE: Rellenar con los Agent IDs reales de ElevenLabs
// Los agentes los está creando el equipo de ElevenLabs

export const ELEVENLABS_AGENTS = {
  es: 'AGENT_ID_ESPAÑOL_AQUI',
  en: 'AGENT_ID_ENGLISH_HERE',
  fr: 'AGENT_ID_FRANCAIS_ICI',
};

// ⚠️  PENDIENTE: Rellenar con el teléfono real del Hotel Tierra de Biescas
export const HOTEL_TIERRA_PHONE = '+34 974 XXX XXX';

export const IDLE_TIMEOUT_SECONDS = 120;

// IDs que se consideran placeholders (no configurados aún)
export const PLACEHOLDER_IDS = Object.values(ELEVENLABS_AGENTS).filter((id) =>
  ['AGENT_ID_ESPAÑOL_AQUI', 'AGENT_ID_ENGLISH_HERE', 'AGENT_ID_FRANCAIS_ICI'].includes(id)
);
