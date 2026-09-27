import translations from './translations.json'

const DEFAULT_LANGUAGE = 'es'

export function t(key, params = {}) {
  const template = translations[DEFAULT_LANGUAGE][key] || translations.en[key] || key

  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (placeholder, name) => {
    return Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : placeholder
  })
}

export { translations }
