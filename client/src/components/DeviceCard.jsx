export default function DeviceCard({ name, ip, onOpen }) {
    return (
        <div className="device-card">
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{name}</h3>
            <p style={{ margin: '5px 0', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>IP: {ip}</p>
            <button
                onClick={onOpen}
                style={{
                    display: 'inline-block', padding: '6px 20px', background: 'var(--accent)',
                    color: '#000', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem',
                    border: 'none', cursor: 'pointer'
                }}
            >
                Abrir
            </button>
        </div>
    );
}
