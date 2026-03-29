import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../MainLogo.jpeg'
import slide1 from '../mp.jpg'
import slide2 from '../2.jpg'
import slide3 from '../3.jpg'
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

const slides = [slide1, slide2, slide3]

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Slider
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
        const role = (savedUser.role || '').toLowerCase()
        if (role === 'sales') {
          // Sales users go straight to POS — auto-set branch if available
          if (savedUser.branch_id && !localStorage.getItem('awosel_active_branch')) {
            localStorage.setItem('awosel_active_branch', JSON.stringify({
              uuid: savedUser.branch_id,
              id: savedUser.branch_id,
              name: savedUser.branch_name || 'My Branch',
            }))
          }
          navigate('/pos', { replace: true })
        } else if (role === 'manager') {
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

      if (trimmedPassword.length < 6) {
        setError('Password must be at least 6 characters')
        setIsLoading(false)
        return
      }

      const result = await login(trimmedEmail, trimmedPassword)

      if (result.success) {
        // Use the user object from the login response — not localStorage (avoids race condition)
        const loggedInUser = result.user || {}
        const role = (loggedInUser.role || '').toLowerCase()
        try {
          if (role === 'sales') {
            if (loggedInUser.branch_id) {
              localStorage.setItem('awosel_active_branch', JSON.stringify({
                uuid: loggedInUser.branch_id,
                id: loggedInUser.branch_id,
                name: loggedInUser.branch_name || 'My Branch',
              }))
            }
            navigate('/pos', { replace: true })
          } else if (role === 'manager') {
            if (loggedInUser.branch_id) {
              localStorage.setItem('awosel_active_branch', JSON.stringify({
                uuid: loggedInUser.branch_id,
                id: loggedInUser.branch_id,
                name: loggedInUser.branch_name || 'My Branch',
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
    <div className="min-h-screen flex">
      {/* Left Panel — Image Slider */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-10">
        {/* Slide images */}
        {slides.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentSlide === i ? 1 : 0,
            }}
          />
        ))}
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70" />

        {/* Top spacer */}
        <div className="relative z-10" />

        {/* Center content */}
        <div className="relative z-10 -mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs text-primary-300 font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Trusted by 500+ businesses
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Manage your store<br />
            <span className="text-primary-400">smarter, not harder.</span>
          </h1>
          <p className="text-gray-300 text-base leading-relaxed max-w-sm">
            Inventory, sales, invoicing, and analytics — all in one powerful platform built for growing businesses.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['POS System', 'Inventory', 'Invoicing', 'Reports', 'Multi-Branch'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-xs text-white/80 font-medium">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom — Slide indicators */}
        <div className="relative z-10 flex items-center justify-between">
          <p className="text-white/40 text-xs">© 2026 MicroBiz. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === i
                    ? 'w-6 h-2 bg-primary-400'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <div className="flex justify-start mb-6">
            <img src={logo} alt="MicroBiz" className="h-14 object-contain" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1.5">Sign in to continue to your dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-[3px]">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-red-700 leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-[3px] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-[3px] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-offset-0"
              />
              <label htmlFor="remember" className="ml-2.5 text-sm text-gray-600">Keep me signed in</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-[3px] font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">New to StorePro?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register link */}
          <Link
            to="/register"
            className="w-full py-3 px-4 rounded-[3px] font-semibold text-sm text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Create an account
            <ArrowRight size={14} className="text-gray-400" />
          </Link>

          {/* Footer — mobile only */}
          <p className="mt-8 text-center text-xs text-gray-400 lg:hidden">
            © 2026 StorePro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

