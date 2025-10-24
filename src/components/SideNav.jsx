import { useNavigate } from "react-router-dom"

export default function SideNav() {
  const navigate = useNavigate()

  function handleLogout() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userId')
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('avatar')
    
    window.location.href = "/login"
  }

  return (
    <aside className="sidenav">
      <button className="logout-btn" onClick={handleLogout}>
        Logga ut
      </button>
    </aside>
  )
}