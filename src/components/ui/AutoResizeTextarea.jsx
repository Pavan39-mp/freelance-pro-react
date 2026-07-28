import React, { useEffect, useRef } from 'react';

const AutoResizeTextarea = ({ className = '', maxHeight = 192, value, onInput, ...props }) => {
    const textareaRef = useRef(null);

    const resize = () => {
        const element = textareaRef.current;
        if (!element) return;
        element.style.height = 'auto';
        element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
        element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden';
    };

    useEffect(resize, [value, maxHeight]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onInput={(event) => {
                resize();
                onInput?.(event);
            }}
            className={`${className} resize-none`}
            {...props}
        />
    );
};

export default AutoResizeTextarea;
