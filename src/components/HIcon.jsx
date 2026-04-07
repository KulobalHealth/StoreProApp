import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'

/**
 * Thin wrapper around HugeiconsIcon for consistent defaults.
 *
 * Usage:
 *   import { HIcon } from '../components/HIcon'
 *   import { Home01Icon } from '@hugeicons/core-free-icons'
 *   <HIcon icon={Home01Icon} size={20} className="text-gray-500" />
 */
export const HIcon = ({ icon, size = 20, color = 'currentColor', strokeWidth = 1.5, className = '', style, ...rest }) => {
  // Guard: if icon data is missing / undefined, render nothing instead of crashing
  if (!icon) return null

  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      {...rest}
    />
  )
}

export default HIcon
