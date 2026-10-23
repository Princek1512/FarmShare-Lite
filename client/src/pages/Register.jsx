import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { validateAadhaar, formatAadhaar } from '../utils/verhoeff'

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    aadhaar: '',
    otp: '',
    password: '',
  })

  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [demoSms, setDemoSms] = useState(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const { user, register } = useAuth()
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/" />
  }

  const cleanAadhaar = form.aadhaar.replace(/\s+/g, '')
  const isAadhaarLengthValid = cleanAadhaar.length === 12
  const isAadhaarChecksumValid = isAadhaarLengthValid && validateAadhaar(cleanAadhaar)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleAadhaarChange(e) {
    const formatted = formatAadhaar(e.target.value)
    setForm({ ...form, aadhaar: formatted })
    setError('')
    setSuccessMsg('')
  }

  // Quick helper to fill a valid test Aadhaar number
  function handleUseSampleAadhaar() {
    setForm({ ...form, aadhaar: '3675 9834 5616' })
    setError('')
  }

  async function handleSendOtp() {
    setError('')
    setSuccessMsg('')

    if (!isAadhaarChecksumValid) {
      setError('Please enter a valid 12-digit Aadhaar number that conforms to the UIDAI checksum.')
      return
    }

    setOtpLoading(true)
    try {
      const res = await api.post('/auth/aadhaar/send-otp', {
        aadhaar: cleanAadhaar,
        email: form.email,
      })

      setOtpSent(true)
      setSuccessMsg(res.data.message || 'OTP sent successfully!')
      setDemoSms({
        masked: res.data.maskedAadhaar,
        otp: res.data.demoOtp,
      })

      // Auto-fill OTP field for demo convenience
      if (res.data.demoOtp) {
        setForm((prev) => ({ ...prev, otp: res.data.demoOtp }))
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send Aadhaar OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!otpSent || !form.otp) {
      setError('Please verify your Aadhaar number by requesting and entering the OTP.')
      return
    }

    if (form.otp.trim().length !== 6) {
      setError('Aadhaar OTP must be 6 digits.')
      return
    }

    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        aadhaar_number: cleanAadhaar,
        otp: form.otp.trim(),
      })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-green-100">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">🚜</span>
          <h2 className="text-2xl font-bold text-green-900">Create Account</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          One verified account lets you list equipment, rent machines, and securely trade with farmers.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-4">
            {error}
          </div>
        )}

        {successMsg && !error && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg px-3 py-2.5 mb-4">
            {successMsg}
          </div>
        )}

        {/* Demo Simulated UIDAI SMS Toast */}
        {demoSms && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3.5 mb-4 text-xs text-amber-900 shadow-sm">
            <div className="flex items-center justify-between font-semibold mb-1">
              <span className="flex items-center gap-1">
                <span>🔔</span> UIDAI SMS Notification (Free Mode):
              </span>
              <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px]">Demo</span>
            </div>
            <p className="mt-1">
              OTP for Aadhaar <span className="font-mono font-bold">{demoSms.masked}</span> is{' '}
              <span className="font-mono font-extrabold text-sm text-green-800 bg-white px-2 py-0.5 rounded border border-amber-300">
                {demoSms.otp}
              </span>
            </p>
            <p className="text-[11px] text-amber-700 mt-1.5 italic">
              Auto-filled below for instant testing without SMS gateway charges.
            </p>
          </div>
        )}

        {/* Name */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Ramesh Patel"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="farmer@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Phone */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Phone Number</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Aadhaar Number with Verhoeff validation */}
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider">
              Aadhaar Card Number
            </label>
            <button
              type="button"
              onClick={handleUseSampleAadhaar}
              className="text-[11px] text-green-700 hover:text-green-800 underline font-medium"
            >
              Fill Sample Aadhaar
            </button>
          </div>

          <div className="relative">
            <input
              name="aadhaar"
              value={form.aadhaar}
              onChange={handleAadhaarChange}
              maxLength={14}
              placeholder="1234 5678 9012"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>

          {/* Validation Status indicator */}
          <div className="mt-1.5 flex items-center justify-between text-xs">
            {cleanAadhaar.length === 0 ? (
              <span className="text-gray-400">12 digits required</span>
            ) : isAadhaarChecksumValid ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span>✓</span> Valid UIDAI Aadhaar Checksum
              </span>
            ) : cleanAadhaar.length === 12 ? (
              <span className="text-rose-600 font-medium flex items-center gap-1">
                <span>✗</span> Invalid Checksum (Verhoeff failed)
              </span>
            ) : (
              <span className="text-gray-500">{12 - cleanAadhaar.length} more digits needed</span>
            )}

            <button
              type="button"
              disabled={!isAadhaarChecksumValid || otpLoading}
              onClick={handleSendOtp}
              className="bg-green-700 hover:bg-green-800 disabled:opacity-40 text-white font-medium px-2.5 py-1 rounded text-xs transition"
            >
              {otpLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </div>
        </div>

        {/* OTP Input (Shown once OTP is requested) */}
        {otpSent && (
          <div className="mb-4 animate-fadeIn">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Enter 6-Digit Aadhaar OTP
            </label>
            <input
              name="otp"
              maxLength={6}
              value={form.otp}
              onChange={handleChange}
              placeholder="e.g. 584920"
              className="w-full border-2 border-green-500 rounded-lg px-3 py-2 font-mono text-center tracking-widest text-lg font-bold bg-green-50/30 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        )}

        {/* Password */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Set Password</label>
          <input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !otpSent}
          className="w-full bg-green-700 text-white py-2.5 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50 transition shadow-sm text-sm"
        >
          {loading ? 'Creating account...' : otpSent ? 'Verify Aadhaar & Register' : 'Request OTP to Continue'}
        </button>

        <p className="text-xs text-gray-600 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-green-700 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Register
