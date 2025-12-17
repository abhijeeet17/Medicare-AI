import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, Droplet, ArrowRight } from 'lucide-react';
import PredictionForm from './components/PredictionForm';

function App() {
  const [selectedModel, setSelectedModel] = useState(null);

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-4xl">
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <div className="p-2 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg">
              <Activity className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              MediCare
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg"
          >
            Advanced Machine Learning for Health Risk Assessment
          </motion.p>
        </header>

        <AnimatePresence mode="wait">
          {!selectedModel ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Heart Disease Card */}
              <button
                onClick={() => setSelectedModel('heart')}
                className="group relative p-8 glass-panel rounded-2xl text-left transition-all hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Heart size={120} />
                </div>
                <div className="relative z-10">
                  <div className="p-3 bg-red-500/20 w-fit rounded-xl mb-6 text-red-400 group-hover:scale-110 transition-transform">
                    <Heart size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-red-300 transition-colors">Heart Disease</h3>
                  <p className="text-gray-400 mb-6">Analyze cardiovascular health indicators to predict potential heart risks using advanced logistic and probabilistic models.</p>
                  <div className="flex items-center text-sm font-semibold text-red-400 group-hover:translate-x-2 transition-transform">
                    Start Prediction <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </button>

              {/* Diabetes Card */}
              <button
                onClick={() => setSelectedModel('diabetes')}
                className="group relative p-8 glass-panel rounded-2xl text-left transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Droplet size={120} />
                </div>
                <div className="relative z-10">
                  <div className="p-3 bg-blue-500/20 w-fit rounded-xl mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                    <Droplet size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors">Diabetes</h3>
                  <p className="text-gray-400 mb-6">Assess the likelihood of diabetes based on diagnostic measures like glucose, insulin, and BMI.</p>
                  <div className="flex items-center text-sm font-semibold text-blue-400 group-hover:translate-x-2 transition-transform">
                    Start Prediction <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </button>
            </motion.div>
          ) : (
            <PredictionForm
              key="form"
              modelType={selectedModel}
              onBack={() => setSelectedModel(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
