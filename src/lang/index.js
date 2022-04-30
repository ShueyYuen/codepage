import { createI18n } from 'vue-i18n' // import from runtime only
// User defined lang
import enLocale from './en'
import zhLocale from './zh'

const messages = {
  en: enLocale,
  cn: zhLocale,
}

const i18n = createI18n({
  locale: 'cn',
  messages: messages,
})

export default i18n