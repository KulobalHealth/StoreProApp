import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <p>© {new Date().getFullYear()} StorePro. All rights reserved.</p>
        <p>Powered by <span className="font-semibold text-primary-600">Data Leap Technologies INC</span></p>
      </div>
    </footer>
  )
}

export default Footer
