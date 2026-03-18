export const LANGUAGES = [
  {
    code: 'es',
    label: 'Español',
    agentId: 'agent_0901kjse236sfktvqhyhpzds95dm',
  },
  {
    code: 'en',
    label: 'English',
    agentId: 'AGENT_ID_ENGLISH_HERE',
  },
  {
    code: 'fr',
    label: 'Français',
    agentId: 'AGENT_ID_FRANCAIS_ICI',
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
