import React from 'react';
import { Link } from 'react-router-dom';

export default function DeviceManagement() {
    const [devices, setDevices] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [activeTab, setActiveTab] = React.useState('gabinetes');
    const [editing, setEditing] = React.useState(null);
    const [form, setForm] = React.useState({ name: '', ip: '', category: 'gabinetes' });
    const token = sessionStorage.getItem('token');
    const apiBase = '';

    React.useEffect(function() { fetchDevices(); }, []);

    function fetchDevices() {
        setError('');
        fetch(apiBase + '/api/devices', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (Array.isArray(data)) setDevices(data);
            else setError(data.error || 'Error al cargar');
            setLoading(false);
        })
        .catch(function() { setError('Error de conexion'); setLoading(false); });
    }

    function handleChange(field, value) {
        setForm(function(prev) {
            var newForm = {};
            for (var key in prev) newForm[key] = prev[key];
            newForm[field] = value;
            return newForm;
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        setError(''); setSuccess('');
        var url = editing ? apiBase + '/api/devices/' + editing : apiBase + '/api/devices';
        var method = editing ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(form)
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.message) {
                setSuccess(editing ? 'Dispositivo actualizado' : 'Dispositivo creado');
                resetForm();
                fetchDevices();
            } else { setError(data.error || 'Error'); }
        })
        .catch(function() { setError('Error de conexion'); });
    }

    function handleEdit(device) {
        setEditing(device.id);
        setForm({ name: device.name, ip: device.ip, category: device.category });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleDelete(id) {
        if (!confirm('¿Eliminar este dispositivo?')) return;
        fetch(apiBase + '/api/devices/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.message) { setSuccess('Dispositivo eliminado'); fetchDevices(); }
            else setError(data.error || 'Error');
        })
        .catch(function() { setError('Error de conexion'); });
    }

    function resetForm() {
        setEditing(null);
        setForm({ name: '', ip: '', category: 'gabinetes' });
    }

    var filteredDevices = devices.filter(function(d) { return d.category === activeTab; });

    var tabs = [
        { id: 'gabinetes', label: '🗄️ Gabinetes' },
        { id: 'ups-dc', label: '⚡ UPS - DC' },
        { id: 'ups-cc', label: '⚡ UPS - CC' },
        { id: 'refrigeracion-dc', label: '❄️ Refrigeración - DC' },
        { id: 'pdus-dc', label: '🔌 PDUs - DC' },
        { id: 'pdus-cc', label: '🔌 PDUs - CC' }
    ];

    return (
        <div className="page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Gestion de Dispositivos</h1>
                <Link to="/" style={{ padding: '8px 15px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }}>
                    ← Volver al Dashboard
                </Link>
            </div>

            {error && <div style={{ color: '#ff4d4d', padding: '10px', background: '#2d1b1b', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
            {success && <div style={{ color: '#00ff00', padding: '10px', background: '#1b2d1b', borderRadius: '4px', marginBottom: '15px' }}>{success}</div>}

            {/* FORMULARIO */}
            <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
                <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>{editing ? 'Editar' : 'Agregar'} Dispositivo</h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <input placeholder="Nombre (ej. Monitoreo Gabinete-1)" value={form.name} onChange={function(e) { handleChange('name', e.target.value); }} required
                        style={{ padding: '10px', background: '#0b0f19', border: '1px solid #2d3748', color: '#fff', borderRadius: '4px' }} />
                    <input placeholder="IP (ej. 10.5.9.113)" value={form.ip} onChange={function(e) { handleChange('ip', e.target.value); }} required
                        style={{ padding: '10px', background: '#0b0f19', border: '1px solid #2d3748', color: '#fff', borderRadius: '4px' }} />
                    <select value={form.category} onChange={function(e) { handleChange('category', e.target.value); }}
                        style={{ padding: '10px', background: '#0b0f19', border: '1px solid #2d3748', color: '#fff', borderRadius: '4px' }}>
                        <option value="gabinetes">Gabinetes</option>
                        <option value="ups-dc">UPS - DC</option>
                        <option value="ups-cc">UPS - CC</option>
                        <option value="refrigeracion-dc">Refrigeración - DC</option>
                        <option value="pdus-dc">PDUs - DC</option>
                        <option value="pdus-cc">PDUs - CC</option>
                    </select>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
                        <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                            {editing ? 'Actualizar' : 'Agregar'}
                        </button>
                        {editing && (
                            <button type="button" onClick={resetForm} style={{ padding: '10px 20px', background: '#555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* PESTANAS DE CATEGORIAS */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid var(--border-color)' }}>
                {tabs.map(function(tab) {
                    return (
                        <button key={tab.id} onClick={function() { setActiveTab(tab.id); }}
                            style={{
                                padding: '10px 20px',
                                background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                                color: activeTab === tab.id ? '#000' : '#fff',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '3px solid var(--accent)' : '3px solid transparent',
                                borderRadius: '4px 4px 0 0',
                                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}>
                            {tab.label} ({devices.filter(function(d) { return d.category === tab.id; }).length})
                        </button>
                    );
                })}
            </div>

            {/* LISTA DE DISPOSITIVOS */}
            <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>Dispositivos - {tabs.find(function(t) { return t.id === activeTab; }).label}</h2>
                {loading ? <p>Cargando...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nombre</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>IP</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDevices.map(function(d) {
                                return (
                                    <tr key={d.id} style={{ borderBottom: '1px solid #1e2433' }}>
                                        <td style={{ padding: '10px' }}>{d.name}</td>
                                        <td style={{ padding: '10px' }}>{d.ip}</td>
                                        <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                                            <button onClick={function() { handleEdit(d); }} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                Editar
                                            </button>
                                            <button onClick={function() { handleDelete(d.id); }} style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredDevices.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No hay dispositivos en esta categoria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
