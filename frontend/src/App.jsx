import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
        {/* Brand Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 shadow-sm">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>

        {/* Platform Title */}
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          HomeServe
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-base font-medium text-slate-600">
          Home Services Booking Platform
        </p>

        {/* Status Indicator */}
        <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Frontend is running successfully.
        </div>

        {/* Phase Info */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400">
          Phase 3.1 &bull; React + Vite + Tailwind CSS v3.4.x
        </div>
      </div>
    </div>
  )
}

export default App
