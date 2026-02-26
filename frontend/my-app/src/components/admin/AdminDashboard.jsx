import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function AdminDashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [scheduledTimes, setScheduledTimes] = useState({})
  const [showDelayInput, setShowDelayInput] = useState(false)
  const [deleteDelayValue, setDeleteDelayValue] = useState(1)
  const [deleteDelayType, setDeleteDelayType] = useState("minutes")
  const [actionLoading, setActionLoading] = useState(false)

  const studentsPerPage = 5
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/login', { replace: true })
  }

  const confirmToast = (message, onConfirm) => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>{message}</p>
          <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                closeToast()
                onConfirm()
              }}
              style={{
                backgroundColor: '#e74c3c',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Confirm
            </button>
            <button
              onClick={closeToast}
              style={{
                backgroundColor: '#7f8c8d',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false }
    )
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/students/admin/all-students', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token')
          localStorage.removeItem('role')
          navigate('/login', { replace: true })
          return
        }

        const data = await res.json()
        if (res.ok) setStudents(data)
        else toast.error(data.message || 'Failed to fetch students')
      } catch (err) {
        toast.error('Error fetching students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [token, navigate])

  const indexOfLastStudent = currentPage * studentsPerPage
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent)
  const totalPages = Math.ceil(students.length / studentsPerPage)

  const handlePrevious = () => { if (currentPage > 1) setCurrentPage(currentPage - 1) }
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1) }

  const handleDeleteNow = () => {
    if (selectedStudents.length === 0) {
      toast.warning('Please select at least one student')
      return
    }

    confirmToast(
      `Are you sure you want to delete ${selectedStudents.length} student(s) now?`,
      async () => {
        setActionLoading(true)
        try {
          const res = await fetch("http://localhost:5000/api/admin/students/delete-now", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ studentIds: selectedStudents })
          })

          const data = await res.json()
          if (res.ok) {
            toast.success(data.message)
            setStudents(students.filter(s => !selectedStudents.includes(s._id)))
            setSelectedStudents([])

            const updatedTimes = { ...scheduledTimes }
            selectedStudents.forEach(id => delete updatedTimes[id])
            setScheduledTimes(updatedTimes)
          } else {
            toast.error(data.message || "Failed to delete")
          }
        } catch (err) {
          toast.error("Server error")
        } finally {
          setActionLoading(false)
        }
      }
    )
  }

  const handleDeleteLater = () => {
    if (selectedStudents.length === 0) {
      toast.warning('Please select at least one student')
      return
    }

    confirmToast(
      `Schedule deletion for ${selectedStudents.length} student(s)?`,
      async () => {
        setActionLoading(true)
        try {
          const res = await fetch("http://localhost:5000/api/admin/students/delete-later", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              studentIds: selectedStudents,
              delayType: deleteDelayType,
              delayValue: deleteDelayValue
            })
          })

          const data = await res.json()
          if (res.ok) {
            toast.success(data.message || "Scheduled deletion successfully")

            const multiplier =
              deleteDelayType === "seconds"
                ? 1000
                : deleteDelayType === "minutes"
                ? 60000
                : 3600000

            const deletionTime = new Date(Date.now() + deleteDelayValue * multiplier)

            const updatedTimes = { ...scheduledTimes }
            selectedStudents.forEach(id => {
              updatedTimes[id] = deletionTime
            })

            setScheduledTimes(updatedTimes)
            setSelectedStudents([])
            setShowDelayInput(false)
          } else {
            toast.error(data.message || "Failed to schedule deletion")
          }
        } catch (err) {
          toast.error("Server error")
        } finally {
          setActionLoading(false)
        }
      }
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: '0 10px' }}>
      <h1>Admin Dashboard</h1>
      <h3>Total Students: {students.length}</h3>

      <button
        onClick={handleLogout}
        style={{ backgroundColor: '#555', color: '#fff', padding: '8px 16px', borderRadius: 5, marginBottom: 15 }}
      >
        Logout
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button
          onClick={handleDeleteNow}
          disabled={selectedStudents.length === 0 || actionLoading}
          style={{ backgroundColor: '#e74c3c', color: '#fff', padding: '8px 16px', borderRadius: 5 }}
        >
          {actionLoading ? 'Processing...' : 'Delete Now'}
        </button>

        {!showDelayInput && (
          <button
            onClick={() => setShowDelayInput(true)}
            disabled={selectedStudents.length === 0 || actionLoading}
            style={{ backgroundColor: '#27ae60', color: '#fff', padding: '8px 16px', borderRadius: 5 }}
          >
            Delete Later
          </button>
        )}

        {showDelayInput && (
          <>
            <input
              type="number"
              min="1"
              value={deleteDelayValue}
              onChange={(e) => setDeleteDelayValue(e.target.value)}
              style={{ width: 70, padding: 5 }}
            />
            <select
              value={deleteDelayType}
              onChange={(e) => setDeleteDelayType(e.target.value)}
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
            <button onClick={handleDeleteLater}>
              {actionLoading ? 'Processing...' : 'Confirm'}
            </button>
            <button onClick={() => setShowDelayInput(false)}>Cancel</button>
          </>
        )}
      </div>

      {loading ? <p>Loading...</p> : students.length === 0 ? <p>No students found</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4' }}>
                <th><input type="checkbox"
                  checked={currentStudents.every(s => selectedStudents.includes(s._id))}
                  onChange={(e) => {
                    if (e.target.checked)
                      setSelectedStudents([...new Set([...selectedStudents, ...currentStudents.map(s => s._id)])])
                    else
                      setSelectedStudents(selectedStudents.filter(id => !currentStudents.some(s => s._id === id)))
                  }}
                /></th>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Teacher</th>
                <th>Scheduled</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((s, index) => (
                <tr key={s._id}>
                  <td>
                    <input type="checkbox"
                      checked={selectedStudents.includes(s._id)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedStudents([...selectedStudents, s._id])
                        else
                          setSelectedStudents(selectedStudents.filter(id => id !== s._id))
                      }}
                    />
                  </td>
                  <td>{indexOfFirstStudent + index + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.teacherId?.name || 'N/A'}</td>
                  <td>{scheduledTimes[s._id] ? new Date(scheduledTimes[s._id]).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {students.length > studentsPerPage && (
        <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
          <button onClick={handlePrevious} disabled={currentPage === 1}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default AdminDashboard

