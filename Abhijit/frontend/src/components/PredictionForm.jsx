import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Droplet, BookOpen, Wand2, ShieldCheck, AlertTriangle, RefreshCcw } from 'lucide-react';
import InputCard from './InputCard';
import NotebookViewer from './NotebookViewer';
import ModelPerformance from './ModelPerformance';
import CircularProgress from './CircularProgress';

const PredictionForm = ({ modelType, onBack }) => {
    // Initial States
    const heartInitialState = {
        age: '', sex: 'male', cp: 0, bp: '', chol: '', maxHR: ''
    };
    const diabetesInitialState = {
        pregnancies: '', glucose: '', blood_pressure: '', insulin: '', age: '', bmi: ''
    };

    const [formData, setFormData] = useState(modelType === 'heart' ? heartInitialState : diabetesInitialState);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [metaData, setMetaData] = useState(null);
    const [showNotebook, setShowNotebook] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    const fetchInfo = async () => {
        try {
            setError(null);
            const endpoint = modelType === 'heart' ? 'http://localhost:8000/info/heart' : 'http://localhost:8000/info/diabetes';
            const res = await axios.get(endpoint);
            setMetaData(res.data);
            return true;
        } catch (err) {
            console.error("Failed to load metadata", err);
            setMetaData(null);
            return false;
        }
    };

    // Fetch metadata on mount
    useEffect(() => {
        fetchInfo();
    }, [modelType]);

    const handleRetryConnection = async () => {
        setIsRetrying(true);
        await new Promise(r => setTimeout(r, 1000)); // Fake delay for UX
        const success = await fetchInfo();
        setIsRetrying(false);
        if (success) setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Generate random value within range
    const getRandomValue = (min, max, isInt = false) => {
        const val = Math.random() * (max - min) + min;
        return isInt ? Math.floor(val) : parseFloat(val.toFixed(1));
    };

    const handleSample = () => {
        if (!metaData || !metaData.ranges) {
            alert("Metadata not loaded yet. Please wait a moment or refresh the page.");
            return;
        }

        const newForm = { ...formData };

        // Manual mapping for ranges
        if (modelType === 'heart') {
            console.log("Sampling Heart Data", metaData.ranges);
            if (metaData.ranges['Age']) newForm.age = getRandomValue(metaData.ranges['Age'].min, metaData.ranges['Age'].max, true);
            if (metaData.ranges['BP']) newForm.bp = getRandomValue(metaData.ranges['BP'].min, metaData.ranges['BP'].max, true);
            if (metaData.ranges['Cholesterol']) newForm.chol = getRandomValue(metaData.ranges['Cholesterol'].min, metaData.ranges['Cholesterol'].max, true);
            if (metaData.ranges['Max HR']) newForm.maxHR = getRandomValue(metaData.ranges['Max HR'].min, metaData.ranges['Max HR'].max, true);
            // Chest pain is categorical (0-3) usually, but check if we have ranges
            if (metaData.ranges['Chest pain type']) newForm.cp = getRandomValue(metaData.ranges['Chest pain type'].min, metaData.ranges['Chest pain type'].max, true);
            newForm.sex = Math.random() > 0.5 ? 'male' : 'female';
        } else {
            console.log("Sampling Diabetes Data", metaData.ranges);
            if (metaData.ranges['Pregnancies']) newForm.pregnancies = getRandomValue(metaData.ranges['Pregnancies'].min, metaData.ranges['Pregnancies'].max, true);
            if (metaData.ranges['Glucose']) newForm.glucose = getRandomValue(metaData.ranges['Glucose'].min, metaData.ranges['Glucose'].max, false);
            if (metaData.ranges['Blood pressure']) newForm.blood_pressure = getRandomValue(metaData.ranges['Blood pressure'].min, metaData.ranges['Blood pressure'].max, false);
            if (metaData.ranges['Insulin']) newForm.insulin = getRandomValue(metaData.ranges['Insulin'].min, metaData.ranges['Insulin'].max, false);
            if (metaData.ranges['Age']) newForm.age = getRandomValue(metaData.ranges['Age'].min, metaData.ranges['Age'].max, true);
            if (metaData.ranges['Body mass index']) newForm.bmi = getRandomValue(metaData.ranges['Body mass index'].min, metaData.ranges['Body mass index'].max, false);
        }
        setFormData(newForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        const endpoint = modelType === 'heart' ? 'http://localhost:8000/predict/heart' : 'http://localhost:8000/predict/diabetes';

        try {
            await new Promise(r => setTimeout(r, 2000)); // Add artificial delay for "Building Connection" effect
            // Basic type conversion
            const payload = {};
            for (const key in formData) {
                if (key === 'sex') payload[key] = formData[key];
                else payload[key] = Number(formData[key]);
            }

            const response = await axios.post(endpoint, payload);
            setResult(response.data);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || 'Failed to get prediction. Please check inputs or server status.';
            setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setLoading(false);
        }
    };

    const isHeart = modelType === 'heart';
    const notebookUrl = isHeart ? 'http://localhost:8000/notebooks/heart_disease.html' : 'http://localhost:8000/notebooks/diabetes.html';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto w-full px-4"
        >
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    &larr; Back to Selection
                </button>
            </div>

            <AnimatePresence>
                {showNotebook && <NotebookViewer url={notebookUrl} onClose={() => setShowNotebook(false)} />}
            </AnimatePresence>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Input Parameters */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
                        <div className={`p-3 rounded-full ${isHeart ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {isHeart ? <Activity size={24} /> : <Droplet size={24} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {isHeart ? 'Heart Disease' : 'Diabetes'}
                            </h2>
                            <p className="text-xs text-gray-400">Patient Data Entry</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isHeart ? (
                                <>
                                    <InputCard
                                        label="Age"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="Years"
                                        min={metaData?.ranges?.['Age']?.min}
                                        max={metaData?.ranges?.['Age']?.max}
                                    />
                                    <InputCard label="Sex" name="sex" value={formData.sex} onChange={handleChange} options={[
                                        { label: "Male", value: "male" }, { label: "Female", value: "female" }
                                    ]} />
                                    <InputCard
                                        label="Chest Pain Type (1-4)"
                                        name="cp"
                                        value={formData.cp}
                                        onChange={handleChange}
                                        placeholder="Type"
                                        min={metaData?.ranges?.['Chest pain type']?.min}
                                        max={metaData?.ranges?.['Chest pain type']?.max}
                                    />
                                    <InputCard
                                        label="Resting BP"
                                        name="bp"
                                        value={formData.bp}
                                        onChange={handleChange}
                                        placeholder="mm Hg"
                                        min={metaData?.ranges?.['BP']?.min}
                                        max={metaData?.ranges?.['BP']?.max}
                                    />
                                    <InputCard
                                        label="Cholesterol"
                                        name="chol"
                                        value={formData.chol}
                                        onChange={handleChange}
                                        placeholder="mg/dl"
                                        min={metaData?.ranges?.['Cholesterol']?.min}
                                        max={metaData?.ranges?.['Cholesterol']?.max}
                                    />
                                    <InputCard
                                        label="Max Heart Rate"
                                        name="maxHR"
                                        value={formData.maxHR}
                                        onChange={handleChange}
                                        placeholder="BPM"
                                        min={metaData?.ranges?.['Max HR']?.min}
                                        max={metaData?.ranges?.['Max HR']?.max}
                                    />
                                </>
                            ) : (
                                <>
                                    <InputCard
                                        label="Pregnancies"
                                        name="pregnancies"
                                        value={formData.pregnancies}
                                        onChange={handleChange}
                                        placeholder="Count"
                                        min={metaData?.ranges?.['Pregnancies']?.min}
                                        max={metaData?.ranges?.['Pregnancies']?.max}
                                    />
                                    <InputCard
                                        label="Glucose"
                                        name="glucose"
                                        value={formData.glucose}
                                        onChange={handleChange}
                                        placeholder="mg/dl"
                                        min={metaData?.ranges?.['Glucose']?.min}
                                        max={metaData?.ranges?.['Glucose']?.max}
                                    />
                                    <InputCard
                                        label="Blood Pressure"
                                        name="blood_pressure"
                                        value={formData.blood_pressure}
                                        onChange={handleChange}
                                        placeholder="mm Hg"
                                        min={metaData?.ranges?.['Blood pressure']?.min}
                                        max={metaData?.ranges?.['Blood pressure']?.max}
                                    />
                                    <InputCard
                                        label="Insulin"
                                        name="insulin"
                                        value={formData.insulin}
                                        onChange={handleChange}
                                        placeholder="mu U/ml"
                                        min={metaData?.ranges?.['Insulin']?.min}
                                        max={metaData?.ranges?.['Insulin']?.max}
                                    />
                                    <InputCard
                                        label="Age"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="Years"
                                        min={metaData?.ranges?.['Age']?.min}
                                        max={metaData?.ranges?.['Age']?.max}
                                    />
                                    <InputCard
                                        label="BMI"
                                        name="bmi"
                                        value={formData.bmi}
                                        onChange={handleChange}
                                        placeholder="Value"
                                        min={metaData?.ranges?.['Body mass index']?.min}
                                        max={metaData?.ranges?.['Body mass index']?.max}
                                    />
                                </>
                            )}
                        </div>

                        {/* Action Buttons Row */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <button
                                type="button"
                                onClick={handleSample}
                                className="flex items-center justify-center px-4 py-3 text-sm font-medium bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 transition-all border border-green-500/20"
                            >
                                <Wand2 size={16} className="mr-2" /> Sample Data
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowNotebook(true)}
                                className="flex items-center justify-center px-4 py-3 text-sm font-medium bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 transition-all border border-green-500/20"
                            >
                                <BookOpen size={16} className="mr-2" /> View Notebook
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${loading ? 'bg-gray-600 cursor-not-allowed' :
                                'bg-gradient-to-r from-blue-600 to-blue-400 shadow-blue-500/30'
                                }`}
                        >
                            {loading ? 'Processing...' : 'Analyze Risk Factors'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Right Column: Model Performance & Results */}
                <div className="flex flex-col space-y-6">
                    {/* Dynamic Content Area: Performance / Loading / Result */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="p-8 rounded-2xl border bg-blue-500/5 border-blue-500/20 text-center backdrop-blur-sm h-full flex flex-col items-center justify-center min-h-[400px]"
                                >
                                    <div className="relative mb-6">
                                        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Activity size={24} className="text-blue-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-white font-semibold text-xl mb-2">Establishing Secure Connection</h3>
                                    <p className="text-blue-300/70 text-sm">
                                        Running logical algorithms on backend...
                                    </p>
                                </motion.div>
                            ) : result ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className={`flex-1 p-8 rounded-2xl border backdrop-blur-md flex flex-col items-center justify-center text-center relative overflow-hidden ${result.risk === 1
                                        ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)]'
                                        : 'bg-green-500/10 border-green-500/30 shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)]'
                                        }`}>
                                        {/* Background Glow Effect */}
                                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${result.risk === 1 ? 'from-red-500/0 via-red-500 to-red-500/0' : 'from-green-500/0 via-green-500 to-green-500/0'}`} />

                                        {/* Status Icon */}
                                        <div className={`p-4 rounded-full mb-6 ${result.risk === 1 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {result.risk === 1 ? <AlertTriangle size={40} strokeWidth={1.5} /> : <ShieldCheck size={40} strokeWidth={1.5} />}
                                        </div>

                                        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
                                            Assessment Complete
                                        </h3>

                                        <div className={`text-5xl font-bold mb-8 ${result.risk === 1 ? 'text-red-400' : 'text-green-400'}`}>
                                            {result.prediction}
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 w-full max-w-xs mb-8">
                                            <div className="flex flex-col items-center">
                                                <CircularProgress
                                                    value={result.accuracy}
                                                    size={100}
                                                    color={result.risk === 1 ? 'text-red-500' : 'text-green-500'}
                                                    label="Confidence"
                                                />
                                            </div>
                                            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10">
                                                <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Model Used</span>
                                                <span className="text-white font-medium text-center">{result.model_used}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setResult(null)}
                                            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm text-gray-300 hover:text-white group"
                                        >
                                            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                                            <span>Start New Analysis</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="performance"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full"
                                >
                                    <ModelPerformance
                                        accuracies={metaData?.all_accuracies}
                                        onRetry={handleRetryConnection}
                                        isRetrying={isRetrying}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PredictionForm;
