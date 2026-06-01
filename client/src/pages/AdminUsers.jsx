import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminUsers() {
    const [users, setUsers] = React.useState([]);
    const [newUser, setNewUser] = React.useState({ username: '', password: '', role: 'personal' });
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const token = sessionStorage.getItem('token');
    const apiBase = '';

    React.useEffect(function() { fetchUsers(); }, []);

    function fetchUsers() {
        fetch(apiBase + '/api/users', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                setError(data.error || 'Error al obtener usuarios');
            }
        })
        .catch(function() { setError('Error de conexion'); });
    }

    function handleCreate(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        fetch(apiBase + '/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(newUser)
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.message) {
                setSuccess('Usuario creado exitosamente');
                setNewUser({ username: '', password: '', role: 'personal' });
                fetchUsers();
            } else {
                setError(data.error || 'Error al crear usuario');
            }
        })
        .catch(function() { setError('Error de conexion'); });
    }

    function handleDelete(id) {
        if (!confirm('Eliminar este usuario?')) return;
        fetch(apiBase + '/api/users/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.message) {
                setSuccess('Usuario eliminado');
                fetchUsers();
            } else {
                setError(data.error || 'Error');
            }
        })
        .catch(function() { setError('Error de conexion'); });
    }

    var roleColors = {
        'administrador': { bg: '#1a365d', color: '#00d4ff' },
        'personal': { bg: '#1a3d1a', color: '#00ff88' },
        'practicantes': { bg: '#3d3a1a', color: '#ffcc00' },
        'apoyo': { bg: '#3d2a1a', color: '#ff8800' },
        'invitados': { bg: '#2d3748', color: '#94a3b8' }
    };

    return (
        <div className="page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Gestion de Usuarios</h1>
                <Link to="/" style={{ padding: '8px 15px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }}>
                    Volver al Dashboard
                </Link>
            </div>

            {error && <div style={{ color: '#ff4d4d', padding: '10px', background: '#2d1b1b', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
            {success && <div style={{ color: '#00ff00', padding: '10px', background: '#1b2d1b', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}

            <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
                <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>Crear Nuevo Usuario</h2>
                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Usuario</label>
                        <input type="text" placeholder="Nombre de usuario" value={newUser.username} onChange={function(e) { setNewUser(function(prev) { return { ...prev, username: e.target.value }; }); }} required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', background: '#0b0f19', border: '1px solid #2d3748', color: '#fff', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Contrasena</label>
                        <input type="password" placeholder="Contrasena" value={newUser.password} onChange={function(e) { setNewUser(function(prev) { return { ...prev, password: e.target.value }; }); }} required
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', background: '#0b0f19', border: '1px solid #2d3748', color: '#fff', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Rol</label>
                        <select value={newUser.role} onChange={function(e) { setNewUser(function(prev) { return { ...prev, role: e.target.value }; }); }}
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', background: '#0b0f19', border: '1px solid #2d3748', color: '#fff', borderRadius: '4px' }}>
                            <option value="personal">Personal</option>
                            <option value="practicantes">Practicantes</option>
                            <option value="apoyo">Apoyo</option>
                            <option value="invitados">Invitados</option>
                        </select>
                    </div>
                    <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Crear
                    </button>
                </form>
            </div>

            <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>Usuarios Existentes</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>ID</th>
                            <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Usuario</th>
                            <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Rol</th>
                            <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(function(u) {
                            var rc = roleColors[u.role] || roleColors.invitados;
                            return (
                                <tr key={u.id} style={{ borderBottom: '1px solid #1e2433' }}>
                                    <td style={{ padding: '10px', fontSize: '0.9rem' }}>{u.id}</td>
                                    <td style={{ padding: '10px', fontSize: '0.9rem' }}>{u.username}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: rc.bg, color: rc.color, fontWeight: 'bold' }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {u.username !== 'admin' ? (
                                            <button onClick={function() { handleDelete(u.id); }} style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                Eliminar
                                            </button>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Admin Principal</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
