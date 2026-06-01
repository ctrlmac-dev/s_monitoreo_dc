import { Link } from 'react-router-dom';

export default function Header({ collapsed, onToggleSidebar }) {
    const username = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('role');

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('role');
        window.location.href = '/login';
    };

    const getRoleLabel = (role) => {
        const labels = {
            'administrador': 'Administrador',
            'personal': 'Personal',
            'practicantes': 'Practicante',
            'apoyo': 'Apoyo',
            'invitados': 'Invitado'
        };
        return labels[role] || role;
    };

    const getRoleColor = (role) => {
        const colors = {
            'administrador': '#00d4ff',
            'personal': '#00ff88',
            'practicantes': '#ffcc00',
            'apoyo': '#ff8800',
            'invitados': '#94a3b8'
        };
        return colors[role] || '#94a3b8';
    };

    return (
        <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                    onClick={onToggleSidebar}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title={collapsed ? 'Mostrar sidebar' : 'Ocultar sidebar'}
                >
                    ☰
                </button>
                <span>Estado Global: <span style={{ color: '#00ff00' }}>Operativo</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{username}</div>
                    <div style={{ fontSize: '0.75rem', color: getRoleColor(role), fontWeight: 'bold' }}>
                        {getRoleLabel(role)}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                    }}
                >
                    Cerrar Sesion
                </button>
            </div>
        </header>
    );
}
