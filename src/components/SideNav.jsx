import { useNavigate } from "react-router-dom"

export default function SideNav() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('avatar')
    navigate("/login")
  }

  return (
    <aside className="sidenav">
      <button className="logout-btn" onClick={handleLogout}>
        Logga ut
      </button>
    </aside>
  )
}