import React from 'react';

export default function DeviceFrame({ title, url }) {
    const [zoom, setZoom] = React.useState(100);
    const [rotation, setRotation] = React.useState(0);
    const [showControls, setShowControls] = React.useState(true);

    function handleZoomIn() {
        setZoom(function(z) { return Math.min(z + 10, 200); });
    }

    function handleZoomOut() {
        setZoom(function(z) { return Math.max(z - 10, 50); });
    }

    function handleRotate() {
        setRotation(function(r) { return (r + 90) % 360; });
    }

    function handleReset() {
        setZoom(100);
        setRotation(0);
    }

    return(
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <div style={{
                padding: '8px 15px',
                backgroundColor: '#1e2536',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{title}</span>
                
                {showControls && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            onClick={handleZoomOut}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: '#fff',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                padding: '2px 8px',
                                fontSize: '14px'
                            }}
                            title="Alejar"
                        >
                            −
                        </button>
                        <span style={{ color: '#fff', fontSize: '12px', minWidth: '40px', textAlign: 'center' }}>
                            {zoom}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: '#fff',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                padding: '2px 8px',
                                fontSize: '14px'
                            }}
                            title="Acercar"
                        >
                            +
                        </button>
                        <button
                            onClick={handleRotate}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: '#fff',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                padding: '2px 8px',
                                fontSize: '12px'
                            }}
                            title="Rotar 90°"
                        >
                            ⟳
                        </button>
                        <button
                            onClick={handleReset}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: '#fff',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                padding: '2px 8px',
                                fontSize: '12px'
                            }}
                            title="Restablecer"
                        >
                            ↺
                        </button>
                    </div>
                )}
            </div>

            <div style={{
                flex: 1,
                overflow: 'auto',
                backgroundColor: '#000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '10px'
            }}>
                <iframe
                    src={url}
                    title={title}
                    style={{
                        border: 'none',
                        backgroundColor: '#fff',
                        width: zoom + '%',
                        height: zoom + '%',
                        minWidth: '50%',
                        minHeight: '50%',
                        transform: 'rotate(' + rotation + 'deg)',
                        transformOrigin: 'top center',
                        transition: 'width 0.2s, height 0.2s, transform 0.2s'
                    }}
                />
            </div>
        </div>
    );
}