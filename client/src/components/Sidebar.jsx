import { NavLink } from 'react-router-dom';

export default function Sidebar({ collapsed }) {
    const token = sessionStorage.getItem('token');
    let role = sessionStorage.getItem('role');

    if ((!role || role === 'null' || role === 'undefined') && token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            role = payload.role;
            sessionStorage.setItem('role', role);
        } catch (e) {
            console.error('Error decodificando token:', e);
        }
    }

    return (
        <aside className={"sidebar" + (collapsed ? " collapsed" : "")}>
            <h2>DC Monitor HUB</h2>
            <nav>
                <NavLink to="/" className="nav-link">📊 Dashboard</NavLink>
                <NavLink to="/gabinetes" className="nav-link">🗄️ Gabinetes</NavLink>
                <NavLink to="/ups" className="nav-link">⚡ UPS - DC</NavLink>
                <NavLink to="/ups-cc" className="nav-link">⚡ UPS - CC</NavLink>
                <NavLink to="/refrigeracion" className="nav-link">❄️ Refrigeración</NavLink>
                <NavLink to="/pdus-dc" className="nav-link">🔌 PDUs - DC</NavLink>
                <NavLink to="/pdus-cc" className="nav-link">🔌 PDUs - CC</NavLink>
                {role === 'administrador' && (
                    <NavLink to="/admin/devices" className="nav-link">🔧 Gestionar Dispositivos</NavLink>
                )}
                {role === 'administrador' && (
                    <NavLink to="/admin/users" className="nav-link">👥 Gestionar Usuarios</NavLink>
                )}
            </nav>
        </aside>
    );
}
