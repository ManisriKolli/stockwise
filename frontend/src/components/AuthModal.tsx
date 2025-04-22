import React, { useEffect } from 'react';
import { SignIn, SignUp, useClerk } from '@clerk/nextjs';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView: 'signIn' | 'signUp';
}

export default function AuthModal({ isOpen, onClose, initialView }: AuthModalProps) {
  const { session } = useClerk();
  
  // Auto-close modal when user is signed in
  useEffect(() => {
    if (session && isOpen) {
      onClose();
    }
  }, [session, isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-black border border-gray-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-white">{initialView === 'signIn' ? 'Sign In' : 'Create Account'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-3">
          {initialView === 'signIn' ? (
            <SignIn 
              routing="hash" 
              afterSignInUrl="/" 
              afterSignUpUrl="/"
              appearance={{
                elements: {
                  formButtonPrimary: 
                    'bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none',
                  formButtonReset:
                    'bg-black border border-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 focus:outline-none',
                  card: 'bg-black',
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
          ) : (
            <SignUp 
              routing="hash" 
              afterSignInUrl="/" 
              afterSignUpUrl="/"
              appearance={{
                elements: {
                  formButtonPrimary: 
                    'bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none',
                  formButtonReset:
                    'bg-black border border-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 focus:outline-none',
                  card: 'bg-black',
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
          )}
        </div>
      </div>
    </div>
  );
}