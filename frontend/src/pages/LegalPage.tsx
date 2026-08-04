import { ReactNode } from 'react'

interface LegalPageProps {
  title: string
  updatedAt: string
  children: ReactNode
}

/** Shared layout for simple static legal pages (Privacy, Terms, Cookies). */
export function LegalPage({ title, updatedAt, children }: LegalPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-sm text-gray-500 mb-10">Última atualização: {updatedAt}</p>
      <div className="space-y-6 text-gray-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-2">
        {children}
      </div>
    </div>
  )
}
