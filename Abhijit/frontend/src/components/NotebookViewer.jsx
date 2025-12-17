import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, Terminal } from 'lucide-react';

const NotebookViewer = ({ url, onClose }) => {
    // Convert logic: if url ends in .html, replace with .ipynb for download
    const downloadUrl = url.replace('.html', '.ipynb');
    const fileName = downloadUrl.split('/').pop();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
        >
            <div className="w-full h-full max-w-6xl flex flex-col bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                {/* Mac-style Title Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-gray-800 select-none">
                    <div className="flex items-center space-x-2">
                        {/* Window Controls */}
                        <div className="flex space-x-2 mr-4">
                            <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        {/* Title */}
                        <div className="flex items-center space-x-2 text-gray-400 text-sm font-mono">
                            <Terminal size={14} />
                            <span>vscode  {fileName}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <a
                            href={downloadUrl}
                            download
                            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition-colors"
                        >
                            <Download size={14} />
                            <span>Download .ipynb</span>
                        </a>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-500 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white relative">
                    <iframe
                        src={url}
                        className="w-full h-full border-none"
                        title="Jupyter Notebook"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default NotebookViewer;
