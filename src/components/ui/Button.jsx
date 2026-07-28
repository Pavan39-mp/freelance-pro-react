import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    type = 'button',
    ...props
}) => {
    const baseStyle = 'px-[1.25rem] py-[0.625rem] rounded-[0.75rem] font-label-caps text-label-caps font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-[0.5rem]';

    const variants = {
        primary: 'bg-primary text-on-primary hover:brightness-115 disabled:opacity-50',
        secondary: 'bg-secondary-container text-on-secondary-container hover:brightness-105 disabled:opacity-50',
        outline: 'border border-border text-on-surface hover:bg-surface-variant/30 disabled:opacity-50',
        ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20 disabled:opacity-50',
        success: 'bg-success text-surface dark:text-background hover:brightness-110 disabled:opacity-50',
        danger: 'bg-danger text-surface dark:text-background hover:brightness-110 disabled:opacity-50'
    };

    return (
        <button
            type={type}
            className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
