import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`glass-card p-[1.5rem] rounded-[1.25rem] shadow-sm transition-all duration-300 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
