import React from 'react';

// IPs que deben abrirse en nueva pestaña debido a problemas de CORS/proxy
const NEW_TAB_IPS = [
    '10.5.9.101', '10.5.9.102', '10.5.9.103', '10.5.9.104', '10.5.9.105',
    '10.5.9.106', '10.5.9.107', '10.5.9.108', '10.5.9.109', '10.5.9.110',
    '10.5.9.111', '10.5.9.112',
    '10.5.9.113', '10.5.9.114', '10.5.9.115',
    '10.5.9.140', '10.5.9.141', '10.5.9.142'
];

export default function NativeDeviceViewer({ title, ip, onClose }) {
    var [src] = React.useState('/proxy/' + ip + '/?_t=' + Date.now());

    // Si la IP está en la lista de nueva pestaña, abrir en nueva pestaña
    React.useEffect(function() {
        if (NEW_TAB_IPS.includes(ip) && onClose) {
            window.open('http://' + ip + '/', '_blank');
            onClose();
        }
    }, [ip, onClose]);

    if (onClose && NEW_TAB_IPS.includes(ip)) {
        return null; // No renderizar nada, ya abrió en nueva pestaña
    }

    if (onClose) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 9999, display: 'flex', flexDirection: 'column', backgroundColor: '#000'
            }}>
                <div style={{
                    padding: '10px 20px', backgroundColor: '#151a27',
                    borderBottom: '1px solid #2d3748', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <span style={{ fontWeight: 'bold', color: '#00d4ff', fontSize: '16px' }}>{title}</span>
                    <button onClick={onClose} style={{
                        background: '#dc2626', border: 'none', color: '#fff',
                        borderRadius: '4px', cursor: 'pointer', padding: '8px 16px',
                        fontSize: '14px', fontWeight: 'bold'
                    }}>✕ Cerrar</button>
                </div>
                <iframe
                    src={src}
                    title={title}
                    sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
                    style={{ flex: 1, border: 'none', width: '100%' }}
                />
            </div>
        );
    }

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <iframe
                src={src}
                title={title}
                sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
                style={{ border: 'none', width: '100%', height: '100%' }}
            />
        </div>
    );
}
