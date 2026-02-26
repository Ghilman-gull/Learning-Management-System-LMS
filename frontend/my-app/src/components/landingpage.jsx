import { Link } from 'react-router-dom'
import '../LandingPage.css'

function LandingPage() {
  return (
    <div className="landing-container">
      <h1>Learning Management System (LMS)</h1>

      <div className="landing-buttons">
        <Link to="/login">
          <button>Login</button>
        </Link>

        <Link to="/signup">
          <button>Sign Up</button>
        </Link>
      </div>
    </div>
  )
}

export default LandingPage
