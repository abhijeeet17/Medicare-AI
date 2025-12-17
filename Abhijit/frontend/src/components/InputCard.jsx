import React, { useState } from 'react';

const InputCard = ({ label, name, type = "number", value, onChange, placeholder, options, min, max }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center mb-1 min-h-[28px]">
                <label className={`text-sm font-medium transition-colors duration-200 ${isFocused ? 'text-blue-400' : 'text-gray-300'} pl-1`}>{label}</label>
                {(min !== undefined && max !== undefined && isFocused) && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex items-center space-x-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-blue-400/80 tracking-wider">Valid</span>
                        <span className="text-xs font-semibold text-blue-200 font-mono">
                            {Number(min).toFixed(0)} - {Number(max).toFixed(0)}
                        </span>
                    </div>
                )}
            </div>
            {options ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all hover:bg-white/10"
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-gray-800">
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    step="any"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all hover:bg-white/10"
                />
            )}
        </div>
    );
};

export default InputCard;
