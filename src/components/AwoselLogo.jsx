import React from 'react'

const AwoselLogo = ({ size = 120, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Yellow circular background */}
        <circle cx="200" cy="200" r="200" fill="#FFD700" />
        
        {/* "awosel" text */}
        <text
          x="200"
          y="180"
          fontFamily="Arial, sans-serif"
          fontSize="64"
          fontWeight="900"
          fill="#000000"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          awosel
        </text>
        
        {/* Curved arrow/smile line */}
        <path
          d="M 80 260 Q 200 300, 320 260"
          stroke="#000000"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        {/* Small upward hooks at the ends */}
        <path
          d="M 80 260 Q 75 255, 70 260"
          stroke="#000000"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 320 260 Q 325 255, 330 260"
          stroke="#000000"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export default AwoselLogo

