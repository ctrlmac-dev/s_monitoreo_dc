import React from 'react';
import DeviceCard from '../components/DeviceCard';
import NativeDeviceViewer from '../components/NativeDeviceViewer';

const SECTIONS = [
    { category: 'gabinetes',        icon: '🗄️', label: 'GABINETES Y SENSORES' },
    { category: 'ups-dc',           icon: '⚡', label: 'UPS - DATA CENTER' },
    { category: 'ups-cc',           icon: '⚡', label: 'UPS - CUARTOS DE COMUNICACION' },
    { category: 'refrigeracion-dc', icon: '❄️', label: 'REFRIGERACION - DATA CENTER' },
    { category: 'pdus-dc',          icon: '🔌', label: 'PDUs - DATA CENTER' },
    { category: 'pdus-cc',          icon: '🔌', label: 'PDUs - CUARTOS DE COMUNICACION' },
];

export default function Dashboard() {
    const [devices, setDevices] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selected, setSelected] = React.useState(null);
    const token = sessionStorage.getItem('token');

    React.useEffect(function() {
        fetch('/api/devices', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(function(r) { return r.json(); })
            .then(function(d) { setDevices(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(function() { setLoading(false); });
    }, []);

    return (
        <>
            {selected && (
                <NativeDeviceViewer
                    title={selected.name + ' (' + selected.ip + ')'}
                    ip={selected.ip}
                    onClose={function() { setSelected(null); }}
                />
            )}
            <div className="page-content">
                <h1>Panel de Monitoreo - Data Center</h1>
                {loading ? <p>Cargando dispositivos...</p> : SECTIONS.map(function(s) {
                    var items = devices.filter(function(d) { return d.category === s.category; });
                    return (
                        <div key={s.category}>
                            <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: '30px', fontSize: '1.2rem' }}>
                                {s.icon} {s.label}
                            </h2>
                            {items.length > 0 ? (
                                <div className="grid-container">
                                    {items.map(function(d) {
                                        return <DeviceCard key={d.id} name={d.name} ip={d.ip} onOpen={function() { setSelected(d); }} />;
                                    })}
                                </div>
                            ) : <p style={{ color: 'var(--text-muted)' }}>No hay dispositivos configurados.</p>}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
