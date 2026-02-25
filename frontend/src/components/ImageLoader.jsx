import { useState } from "react";

export default function ImageLoader({ src, alt, className }) {

    const [loaded, setLoaded] = useState(false);

    return (
        <div className={`image-loader-wrapper ${className || ''}`} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

            {!loaded && <div className="image-skeleton" style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)',
                backgroundSize: '400% 100%',
                animation: 'skeleton 1.4s ease infinite',
                zIndex: 1
            }}></div>}

            <img
                src={src}
                alt={alt}
                className={`image-loader ${loaded ? "loaded" : ""}`}
                style={{
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.6s ease',
                    width: '100%',
                    height: '100%',
                    display: 'block'
                }}
                onLoad={() => setLoaded(true)}
                onError={(e) => {
                    e.target.src = "/images/default-product.jpg"; // You might need to ensure this image exists or use a placeholder URL
                    setLoaded(true);
                }}
            />

            <style>{`
        @keyframes skeleton {
            0% { background-position: 100% 0 }
            100% { background-position: -100% 0 }
        }
      `}</style>

        </div>
    );
}
