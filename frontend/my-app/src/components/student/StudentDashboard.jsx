import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from "../../socket";   

function StudentDashboard() {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(null) 
  const [preview, setPreview] = useState(null)            
  const [isEditing, setIsEditing] = useState(false)      
  const navigate = useNavigate()

  const fileInputRef = useRef(null) 

  useEffect(() => {
    const fetchStudent = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const res = await fetch('http://localhost:5000/api/students/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()

        if (res.ok) {
          setStudent(data.student)

          socket.emit("registerUser", data.student._id);

        } else {
          setError(data.message || 'Failed to fetch student data')
          if (res.status === 401) navigate('/login')
        }
      } catch (err) {
        console.error(err)
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()

    socket.on("forceLogout", (data) => {
      alert(data.message);
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    });

    return () => {
      socket.off("forceLogout"); 
    };

  }, [navigate])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      setPreview(URL.createObjectURL(file))
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    if (!selectedImage) return

    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('image', selectedImage)

    try {
      const res = await fetch('http://localhost:5000/api/students/upload-profile-pic', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setStudent((prev) => ({ ...prev, profilePic: data.profilePic }))
        setSelectedImage(null)
        setPreview(null)
        setIsEditing(false)
        if (fileInputRef.current) fileInputRef.current.value = null
      } else {
        alert(data.message || 'Upload failed')
      }
    } catch (err) {
      console.error(err)
      alert('Network error')
    }
  }

  const handleCancel = () => {
    setSelectedImage(null)
    setPreview(null)
    setIsEditing(false)
    if (fileInputRef.current) fileInputRef.current.value = null
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!student) return null

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>STUDENT DASHBOARD</h2>


      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img
          src={preview || `http://localhost:5000/uploads/${student.profilePic || 'default.png'}`}
          alt="Profile"
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #ccc'
          }}
        />

        <div style={{ marginTop: '10px' }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            id="imageUpload"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <label
            htmlFor="imageUpload"
            style={{
              display: 'inline-block',
              padding: '8px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Upload New Image
          </label>
        </div>

        {isEditing && (
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={handleSave}
              style={{
                marginRight: '10px',
                padding: '8px 15px',
                backgroundColor: 'green',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '5px'
              }}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: '8px 15px',
                backgroundColor: 'gray',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '5px'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <p>Hello <strong>{student.name}</strong></p>
      <p>You Are Added by teacher: <strong>{student.teacherName}</strong></p>

      <h3>Student Details:</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {Object.entries(student).map(([key, value]) => (
            <tr key={key} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px', fontWeight: 'bold', textTransform: 'capitalize' }}>{key}</td>
              <td style={{ padding: '8px' }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleLogout}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </div>
  )
}

export default StudentDashboard

