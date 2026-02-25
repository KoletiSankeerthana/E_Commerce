
const ErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
        <div role="alert" style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Something went wrong.</h2>
            <pre style={{ color: 'red' }}>{error?.message}</pre>
            <button onClick={resetErrorBoundary || (() => window.location.reload())} style={{ padding: '10px 20px', marginTop: '10px' }}>
                Please refresh
            </button>
        </div>
    );
};

export default ErrorFallback;
