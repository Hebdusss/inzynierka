'use client'
import { useLang } from '../i18n/LangContext'
import { TranslationKey } from '../i18n/translations'

export default function T({ k, className }: { k: TranslationKey; className?: string }) {
  const { t } = useLang()
  return <span className={className}>{t(k)}</span>
}
