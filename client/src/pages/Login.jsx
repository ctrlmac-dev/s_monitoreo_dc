import { useState } from 'react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('role', data.role);
                window.location.href = '/';
            } else {
                setError(data.error || 'Error al iniciar sesion');
            }
        } catch (err) {
            setError('Error de conexion con el servidor.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-base)' }}>
            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '40px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--accent)', marginBottom: '30px' }}>DC Monitor HUB</h2>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <input
                            type="text"
                            placeholder="Usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', backgroundColor: '#0b0f19', border: '1px solid #2d3748', color: '#fff', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Contrasena"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', boxSizing: 'border-box', backgroundColor: '#0b0f19', border: '1px solid #2d3748', color: '#fff', borderRadius: '4px' }}
                        />
                    </div>

                    {error && <div style={{ color: '#ff4d4d', fontSize: '0.9rem' }}>{error}</div>}

                    <button type="submit" style={{ padding: '12px', backgroundColor: 'var(--accent)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' }}>
                        Ingresar al Sistema
                    </button>
                </form>
            </div>
        </div>
    );
}
