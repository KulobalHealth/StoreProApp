import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../logo.png'
import { Link } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
        const role = (savedUser.role || '').toLowerCase()
        if (role === 'manager') {
          navigate('/branch-dashboard', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      } catch {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      setIsLoading(true)

      // Input validation
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()

      if (!trimmedEmail || !trimmedPassword) {
        setError('Please enter both email and password')
        setIsLoading(false)
        return
      }

      if (!trimmedEmail.includes('@')) {
        setError('Please enter a valid email address')
        setIsLoading(false)
        return
      }

      if (trimmedPassword.length < 4) {
        setError('Password must be at least 4 characters')
        setIsLoading(false)
        return
      }

      const result = await login(trimmedEmail, trimmedPassword)

      if (result.success) {
        // Check role for redirect
        try {
          const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
          const role = (savedUser.role || '').toLowerCase()
          if (role === 'manager') {
            // Manager goes directly to their assigned branch dashboard
            if (savedUser.branch_id) {
              // Auto-set the manager's assigned branch as active
              localStorage.setItem('awosel_active_branch', JSON.stringify({
                uuid: savedUser.branch_id,
                id: savedUser.branch_id,
                name: savedUser.branch_name || 'My Branch',
              }))
            }
            navigate('/branch-dashboard', { replace: true })
          } else {
            navigate('/dashboard')
          }
        } catch {
          navigate('/dashboard')
        }
      } else {
        setError(result.message || 'Login failed. Please try again.')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred during login. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Awosel OS" className="h-20 object-contain" />
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
              } flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} className="mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Register
            </Link>
          </p>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              © 2026 StorePro. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

