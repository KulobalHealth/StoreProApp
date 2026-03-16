import React from 'react'

/**
 * Lightweight Tooltip component using pure CSS (no third-party lib).
 *
 * Usage:
 *   <Tooltip text="Delete this product">
 *     <button>...</button>
 *   </Tooltip>
 *
 * Props:
 *   text      – tooltip label (required)
 *   position  – 'top' (default) | 'bottom' | 'left' | 'right'
 *   className – extra class on the wrapper
 *   delay     – 'none' | 'fast' (default) | 'slow'
 */
const Tooltip = ({ text, position = 'bottom', children, className = '', delay = 'fast' }) => {
  if (!text) return <>{children}</>

  const posStyles = {
    top: {
      tip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      arrow: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent',
    },
    bottom: {
      tip: 'top-full left-1/2 -translate-x-1/2 mt-2',
      arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent',
    },
    left: {
      tip: 'right-full top-1/2 -translate-y-1/2 mr-2',
      arrow: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent',
    },
    right: {
      tip: 'left-full top-1/2 -translate-y-1/2 ml-2',
      arrow: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent',
    },
  }

  const delayClass = {
    none: '',
    fast: 'delay-100',
    slow: 'delay-500',
  }[delay]

  const { tip, arrow } = posStyles[position] || posStyles.top

  return (
    <span className={`relative inline-flex group/tip ${className}`}>
      {children}
      <span
        className={`
          pointer-events-none absolute z-50 whitespace-nowrap
          rounded-md bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg
          opacity-0 scale-95
          group-hover/tip:opacity-100 group-hover/tip:scale-100
          transition-all duration-150 ${delayClass}
          ${tip}
        `}
        role="tooltip"
      >
        {text}
        {/* Arrow */}
        <span
          className={`absolute border-4 ${arrow}`}
        />
      </span>
    </span>
  )
}

export default Tooltip
