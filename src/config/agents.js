export const LANGUAGES = [
  {
    code: 'es',
    label: 'Español',
    agentId: 'agent_5201kmdtr1jme2sbbe2ygqtm8shp',
  },
  {
    code: 'en',
    label: 'English',
    agentId: 'agent_3401ks5n7hwnf5psyaj0m7k5qt3a',
  },
  {
    code: 'fr',
    label: 'Français',
    agentId: 'agent_5201ks5n86aqfddt0e4axs029tt1',
  },
  // Para añadir un idioma nuevo, añade aquí una entrada y crea su clave en src/i18n/ui.js
  // { code: 'de', label: 'Deutsch', agentId: 'AGENT_ID_DEUTSCH_AQUI' },
];

const PLACEHOLDER_AGENT_IDS = ['AGENT_ID_ENGLISH_HERE', 'AGENT_ID_FRANCAIS_ICI'];

export const PLACEHOLDER_IDS = LANGUAGES
  .map((l) => l.agentId)
  .filter((id) => PLACEHOLDER_AGENT_IDS.includes(id));

export function getAgentId(langCode) {
  return LANGUAGES.find((l) => l.code === langCode)?.agentId ?? null;
}

export const HOTEL_TIERRA_PHONE = '+34 974 48 54 83';
export const IDLE_TIMEOUT_SECONDS = 120;
export const MAX_CONVERSATION_SECONDS = 600;
