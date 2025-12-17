import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, WifiOff } from 'lucide-react';
import CircularProgress from './CircularProgress';

const ModelPerformance = ({ accuracies, onRetry, isRetrying }) => {
    // Define colors for specific models
    const getColor = (modelName) => {
        const name = modelName.toLowerCase();
        if (name.includes('decision tree')) return 'text-green-500';
        if (name.includes('knn')) return 'text-blue-500';
        if (name.includes('logistic')) return 'text-purple-500';
        if (name.includes('naive')) return 'text-yellow-500';
        return 'text-gray-500';
    };

    if (!accuracies) {
        return (
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/10 h-full flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-red-500/10 rounded-full mb-4">
                    <WifiOff size={32} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Backend Disconnected</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-[200px]">
                    Unable to fetch model data. Please ensure the server is running.
                </p>
                <button
                    onClick={onRetry}
                    disabled={isRetrying}
                    className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={16} className={`mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Reconnecting...' : 'Retry Connection'}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/10 h-full">
            <h3 className="text-xl font-bold text-green-400 mb-8 text-center">Model Performance</h3>

            <div className="grid grid-cols-2 gap-6 justify-items-center">
                {Object.entries(accuracies).map(([model, accuracy]) => (
                    <CircularProgress
                        key={model}
                        value={accuracy}
                        label={model}
                        color={getColor(model)}
                        size={110}
                    />
                ))}
            </div>

            <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <p className="text-xs text-blue-200 text-center">
                    Note: These models are trained on validated clinical datasets to ensure high reliability.
                </p>
            </div>
        </div>
    );
};

export default ModelPerformance;
