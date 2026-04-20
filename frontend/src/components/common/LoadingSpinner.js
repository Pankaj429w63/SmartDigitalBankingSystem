import React from 'react';

const LoadingSpinner = ({ fullScreen = false, size = 40, text = 'Loading...' }) => {
  const spinner = (
    <div className="d-flex flex-column align-items-center gap-3">
      <div
        style={{
          width: size, height: size,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #6c63ff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      {text && <p style={{ color: '#8892b0', fontSize: '0.9rem', margin: 0 }}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        {spinner}
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
