import { useState } from 'react'
import { toast } from 'react-toastify'

function AddStudent({ onStudentAdded, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    programName: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return false
    }
    if (!form.email.trim()) {
      toast.error('Email is required')
      return false
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error('Invalid email format')
      return false
    }
    if (!form.programName.trim()) {
      toast.error('Program name is required')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please login first')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/students/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Student added. Password sent to email.')
        setForm({ name: '', email: '', programName: '' })
        if (onStudentAdded) onStudentAdded()
      } else {
        toast.error(data.message || 'Failed to add student')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: 15, borderRadius: 8, marginBottom: 20 }}>
      <h3>ADD STUDENT</h3>

      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <input
        name="programName"
        placeholder="Program Name"
        value={form.programName}
        onChange={handleChange}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Adding...' : 'Submit'}
      </button>
      <button onClick={onCancel} disabled={loading} style={{ marginLeft: 10 }}>
        Cancel
      </button>
    </div>
  )
}

export default AddStudent
