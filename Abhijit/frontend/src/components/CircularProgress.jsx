import React from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({ value, label, color = "text-blue-500", size = 100, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        className="stroke-gray-700"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        className={`stroke-current ${color}`}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                {/* Percentage Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${color}`}>
                        {Math.round(value)}%
                    </span>
                </div>
            </div>
            {/* Label */}
            <span className="mt-3 text-xs font-medium text-gray-400 text-center max-w-[100px]">
                {label}
            </span>
        </div>
    );
};

export default CircularProgress;
