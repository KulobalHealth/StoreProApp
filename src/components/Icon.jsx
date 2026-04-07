import React from 'react'

/**
 * Font Awesome icon wrapper component.
 * Usage: <Icon name="cart-shopping" /> or <Icon name="gear" size={16} className="text-gray-400" />
 * Prefix defaults to "fa-solid". Use prefix="fa-regular" or prefix="fa-brands" for other styles.
 */
const Icon = ({ name, size, className = '', prefix = 'fa-solid', style = {} }) => {
  const sizeStyle = size ? { fontSize: `${size}px`, width: `${size}px`, ...style } : style
  return (
    <i
      className={`${prefix} fa-${name} ${className}`}
      style={sizeStyle}
      aria-hidden="true"
    />
  )
}

export default Icon
