import React from 'react';
import AutoResizeTextarea from './AutoResizeTextarea';

const Input = ({
    type = 'text',
    label,
    name,
    placeholder,
    value,
    onChange,
    required = false,
    options = [],
    rows = 3,
    className = '',
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    ...props
}) => {
    const baseInputStyle = 'w-full bg-surface-secondary border border-border rounded-[0.75rem] py-[0.625rem] px-[1.25rem] text-text font-body-md placeholder:text-placeholder-color focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200';

    // Add extra padding if icons are present
    const leftPadClass = LeftIcon ? 'pl-[3rem]' : '';
    const rightPadClass = RightIcon ? 'pr-[3rem]' : '';
    const inputStyle = `${baseInputStyle} ${leftPadClass} ${rightPadClass} ${className}`;

    const handleInputChange = (e) => {
        if (!onChange) return;

        if (type === 'tel') {
            e.target.value = e.target.value.replace(/[^0-9+]/g, '');
        } else if (type === 'number') {
            // Allow numbers and decimal points for currencies/rates
            e.target.value = e.target.value.replace(/[^0-9.]/g, '');
        }

        onChange(e);
    };

    return (
        <div className="space-y-[0.5rem] w-full">
            {label && (
                <label className="font-label-caps text-label-caps text-text-secondary ml-[0.25rem]">
                    {label} {required && '*'}
                </label>
            )}

            <div className="relative w-full">
                {LeftIcon && (
                    <div className="absolute left-[1rem] top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none flex items-center justify-center">
                        <LeftIcon className="w-5 h-5" />
                    </div>
                )}

                {type === 'textarea' ? (
                    <AutoResizeTextarea
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        onChange={handleInputChange}
                        required={required}
                        rows={rows}
                        maxHeight={192}
                        className={inputStyle}
                        {...props}
                    />
                ) : type === 'select' ? (
                    <select
                        name={name}
                        value={value}
                        onChange={handleInputChange}
                        required={required}
                        className={`${inputStyle} appearance-none`}
                        {...props}
                    >
                        {placeholder && <option value="" disabled>{placeholder}</option>}
                        {options.map((opt, i) => (
                            <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                                {typeof opt === 'object' ? opt.label : opt}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        name={name}
                        placeholder={placeholder}
                        value={value}
                        onChange={handleInputChange}
                        required={required}
                        className={inputStyle}
                        {...props}
                    />
                )}

                {RightIcon && (
                    <div className="absolute right-[1rem] top-1/2 -translate-y-1/2 flex items-center justify-center">
                        {typeof RightIcon === 'function' ? (
                            <RightIcon className="w-5 h-5 text-text-secondary" />
                        ) : (
                            RightIcon
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Input;
