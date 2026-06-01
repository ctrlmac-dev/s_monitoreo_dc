import React from 'react';
import DeviceCard from './DeviceCard';
import NativeDeviceViewer from './NativeDeviceViewer';

export default function DevicePage({ apiCategory, icon, title, subtitle }) {
    const [devices, setDevices] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const storageKey = 'selectedDevice_' + apiCategory;
    const [selected, setSelected] = React.useState(function() {
        try { return JSON.parse(sessionStorage.getItem(storageKey)); } catch(e) { return null; }
    });
    const token = sessionStorage.getItem('token');

    function selectDevice(d) {
        setSelected(d);
        if (d) { sessionStorage.setItem(storageKey, JSON.stringify(d)); }
        else { sessionStorage.removeItem(storageKey); }
    }

    React.useEffect(function() {
        fetch('/api/devices/' + apiCategory, {
            headers: { 'Authorization': 'Bearer ' + token }
        })
            .then(function(r) { return r.json(); })
            .then(function(d) { setDevices(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(function() { setLoading(false); });
    }, [apiCategory]);

    return (
        <>
            {selected && (
                <NativeDeviceViewer
                    title={selected.name + ' (' + selected.ip + ')'}
                    ip={selected.ip}
                    onClose={function() { selectDevice(null); }}
                />
            )}
            <div className="page-content">
                <h1 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    {icon} {title}
                </h1>
                {loading ? <p>Cargando...</p> : (
                    <div>
                        <p style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
                        <div className="grid-container">
                            {devices.map(function(d) {
                                return (
                                    <DeviceCard
                                        key={d.id}
                                        name={d.name}
                                        ip={d.ip}
                                        onOpen={function() { selectDevice(d); }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
