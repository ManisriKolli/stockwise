"use client";

import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">StockWise</h1>
        <p className="text-gray-400">Sign in to access your watchlist and more</p>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg w-full max-w-md">
        <SignIn 
          routing="path" 
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none',
              formButtonReset:
                'bg-black border border-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 focus:outline-none',
              card: 'bg-transparent',
              headerTitle: 'text-white text-xl',
              headerSubtitle: 'text-gray-400',
              dividerLine: 'bg-gray-800',
              dividerText: 'text-gray-400',
              footerActionLink: 'text-blue-500 hover:text-blue-400',
              formFieldLabel: 'text-gray-300',
              formFieldInput: 'bg-black border border-gray-800 text-white rounded p-2 focus:border-blue-500 focus:outline-none',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-blue-500 hover:text-blue-400',
              alertText: 'text-white',
              socialButtonsBlockButton: 
                'border border-gray-800 bg-black text-white hover:bg-gray-900 hover:border-gray-700',
              socialButtonsBlockButtonText: 'text-white',
              profileSectionTitle: 'text-white',
              otpCodeFieldInput: 'bg-black border border-gray-800 text-white',
            }
          }}
        />
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-400">
          Don't have an account? <Link href="/sign-up" className="text-blue-500 hover:text-blue-400">Sign up</Link>
        </p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 text-gray-500 hover:text-white text-sm"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}