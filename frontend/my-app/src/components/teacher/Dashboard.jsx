import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddStudent from './AddStudent'

function Dashboard() {
  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddStudent, setShowAddStudent] = useState(false)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalStudents, setTotalStudents] = useState(0)

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  const fetchStudents = async (pageNumber, searchTerm) => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)

      const res = await fetch(
        `http://localhost:5000/api/students/my-students?page=${pageNumber}&search=${encodeURIComponent(
          searchTerm
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()

      if (res.ok) {
        setStudents(data.students)
        setTotalPages(data.pagination.totalPages)

        if (typeof data.totalStudents === 'number') {
          setTotalStudents(data.totalStudents)
        }

        setError('')
      } else {
        setStudents([])
        setTotalPages(1)
        setError(data.message || 'Failed to fetch students')
      }
    } catch (err) {
      console.error(err)
      setStudents([])
      setTotalPages(1)
      setError('Error fetching students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    fetchStudents(page, search)
  }, [page, search])

  const handleStudentAdded = () => {
    setShowAddStudent(false)
    setSearch('')
    setPage(1)
    fetchStudents(1, '')
  }

  return (
    <div style={{ maxWidth: 700, margin: '20px auto' }}>
      <h2>TEACHER DASHBOARD</h2>

      <button onClick={() => setShowAddStudent(true)}>Add Student</button>
      <button onClick={logout} style={{ marginLeft: 10 }}>
        Logout
      </button>

      <hr />

      {showAddStudent && (
        <AddStudent
          onStudentAdded={handleStudentAdded}
          onCancel={() => setShowAddStudent(false)}
        />
      )}

      {!showAddStudent && (
        <>
          <input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          />

          {!loading && (
            <p style={{ fontWeight: 'bold', marginBottom: 10 }}>
              Total Students: {totalStudents}
            </p>
          )}

          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && students.length === 0 && <p>No students found.</p>}

          {!loading && students.length > 0 && (
            <>
              <table width="100%" border="1" cellPadding="8">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Program</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.programName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div style={{ marginTop: 15, textAlign: 'center' }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>

                  <span style={{ margin: '0 10px' }}>
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard
