import React from 'react';

export default function NativeDeviceViewer({ title, ip, onClose }) {
    var [src] = React.useState('/proxy/' + ip + '/?_t=' + Date.now());

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
