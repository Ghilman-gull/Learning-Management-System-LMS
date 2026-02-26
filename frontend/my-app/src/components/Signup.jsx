import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      return toast.error('All fields are required')
    }

    if (!isValidEmail(form.email)) {
      return toast.error('Invalid email format')
    }

    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Signup successful')
        navigate('/login')
      } else {
        toast.error(data.message || 'Signup failed')
      }
    } catch (err) {
      toast.error('Network error')
      console.error(err)
    }
  }

  return (
    <div>
      <h2>SIGNUP</h2>

      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <div className="password-field">
  <input
    name="password"
    type={showPassword ? 'text' : 'password'}
    placeholder="Password"
    value={form.password}
    onChange={handleChange}
  />

  <span onClick={() => setShowPassword(!showPassword)}>
    {showPassword ? 'Hide' : 'Show'}
  </span>
</div>


      <button onClick={handleSubmit}>Signup</button>
    </div>
  )
}

export default Signup




