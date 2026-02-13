'use client'
import React from 'react'
import { useLang } from '../i18n/LangContext'

interface Props {
    title: string
}

const FormsHeader = ({title}: Props) => {
  const { t } = useLang()
  return (
    <div className='mb-6'>
        <h2 className='section-title'>{t('forms.addNew')} {title}</h2>
        <p className='text-sm text-slate-400 mt-1'>{t('forms.fillDetails')}</p>
    </div>
  )
}

export default FormsHeader