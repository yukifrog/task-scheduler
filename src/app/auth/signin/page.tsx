'use client'

import { signIn, getProviders } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ClientSafeProvider } from 'next-auth/react'

function SignInForm() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null)
  const [email, setEmail] = useState('')
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    const loadProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    loadProviders()
  }, [])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      await signIn('demo', { email, callbackUrl: '/' })
    }
  }

  if (!providers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            タスクスケジューラーにサインイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            実績ベース計画システムで生産性を向上させましょう
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error === 'OAuthSignin' && 'OAuth認証でエラーが発生しました'}
            {error === 'OAuthCallback' && 'OAuth認証の処理でエラーが発生しました'}
            {error === 'OAuthCreateAccount' && 'アカウント作成でエラーが発生しました'}
            {error === 'EmailCreateAccount' && 'メール認証でエラーが発生しました'}
            {error === 'Callback' && 'コールバック処理でエラーが発生しました'}
            {error === 'OAuthAccountNotLinked' && 'このアカウントは既に別の方法で登録されています'}
            {error === 'EmailSignin' && 'メール送信でエラーが発生しました'}
            {error === 'CredentialsSignin' && '認証情報が正しくありません'}
            {error === 'default' && '認証でエラーが発生しました'}
          </div>
        )}

        <div className="space-y-6">
          {/* Email Sign In */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              デモログイン
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">または</span>
            </div>
          </div>

          {/* OAuth Providers */}
          <div className="space-y-3">
            {Object.values(providers)
              .filter((provider: ClientSafeProvider) => provider.id !== 'email')
              .map((provider: ClientSafeProvider) => (
                <button
                  key={provider.name}
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  {provider.name}でサインイン
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}