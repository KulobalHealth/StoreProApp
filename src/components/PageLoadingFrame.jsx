import React from 'react'

const Pulse = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />
)

const PageLoadingFrame = ({ fullScreen = false }) => (
  <div
    className={`${fullScreen ? 'min-h-screen' : 'min-h-full'} bg-[#eaf0f7] px-4 py-4 sm:px-6 lg:px-8`}
    role="status"
    aria-live="polite"
    aria-label="Loading page"
  >
    <span className="sr-only">Loading page</span>
    <div className="mx-auto w-full max-w-[1500px]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Pulse className="h-5 w-44" />
          <Pulse className="h-3 w-72 max-w-[65vw]" />
        </div>
        <Pulse className="h-9 w-32" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map(item => (
          <div key={item} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <Pulse className="mb-3 h-8 w-8" />
            <Pulse className="mb-2 h-5 w-20" />
            <Pulse className="h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-3">
          <Pulse className="h-9 flex-1" />
          <Pulse className="h-9 w-28" />
        </div>
        <div className="space-y-px bg-slate-100">
          {[0, 1, 2, 3, 4, 5].map(row => (
            <div key={row} className="grid grid-cols-12 gap-4 bg-white px-4 py-3">
              <Pulse className="col-span-4 h-4" />
              <Pulse className="col-span-3 h-4" />
              <Pulse className="col-span-3 h-4" />
              <Pulse className="col-span-2 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default PageLoadingFrame
