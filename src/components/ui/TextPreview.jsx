import React from 'react';

const TextPreview = ({ children, lines = 3, className = '' }) => (
    <p
        className={`break-words whitespace-pre-wrap overflow-hidden ${className}`}
        style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: lines }}
    >
        {children}
    </p>
);

export default TextPreview;
