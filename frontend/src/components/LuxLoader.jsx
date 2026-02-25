export default function LuxLoader() {
    return (
        <div className="lux-loader-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', width: '100%' }}>
            <div className="lux-spinner"></div>
            <style>{`
        .lux-spinner {
            width: 50px;
            height: 50px;
            border: 2px solid rgba(255, 62, 108, 0.1);
            border-top: 2px solid #ff3e6c;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `}</style>
        </div>
    );
}
