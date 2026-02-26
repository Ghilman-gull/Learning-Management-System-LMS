import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.email || !form.password) {
    return toast.error('Email and password are required');
  }

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) {
      return toast.error(data.message || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);

    toast.success('Login successful');

    if (data.role === 'admin') navigate('/admin/dashboard');
    else if (data.role === 'teacher') navigate('/teacher-dashboard');
    else if (data.role === 'student') navigate('/student-dashboard');
  } catch (err) {
    toast.error('Login failed');
    console.error(err);
  }
};
  return (
    <div>
      <h2>LOGIN</h2>

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

      <button type="button" onClick={handleSubmit}>
        Login
      </button>

      <p>
        New user? <Link to="/signup">Signup</Link>
      </p>
    </div>
  )
}

export default Login
