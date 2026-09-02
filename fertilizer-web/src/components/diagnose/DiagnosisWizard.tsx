import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CROPS_LIST, GROWTH_STAGES } from '../../utils/constants';
import { SymptomSelector } from './SymptomSelector';
import { ImageUploader } from './ImageUploader';
import { Button } from '../common/Button';
import { diagnoseApi } from '../../api/diagnoseApi';
import { 
  Stethoscope, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  ScanLine, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Database 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DiagnosisWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [growthStage, setGrowthStage] = useState('Flowering & Booting');
  const [symptoms, setSymptoms] = useState<string[]>(['Yellowing Leaves (Chlorosis)', 'Brown / Black Spots']);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [loadingStageText, setLoadingStageText] = useState('Extracting leaf pathology & growth stage parameters...');

  const handleToggleSymptom = (label: string) => {
    if (symptoms.includes(label)) {
      setSymptoms(symptoms.filter(s => s !== label));
    } else {
      setSymptoms([...symptoms, label]);
    }
  };

  // Dynamic progress animation for AI Diagnostic Loading Screen
  useEffect(() => {
    let timer1: any, timer2: any, timer3: any, timer4: any;
    if (isSubmitting) {
      setLoadingProgress(18);
      setLoadingStageText('Extracting leaf pathology & growth stage parameters...');

      timer1 = setTimeout(() => {
        setLoadingProgress(45);
        setLoadingStageText('Running Gemini 2.5 AI Pathology Vision Model...');
      }, 1000);

      timer2 = setTimeout(() => {
        setLoadingProgress(78);
        setLoadingStageText('Matching targeted bio-treatments in store database...');
      }, 2200);

      timer3 = setTimeout(() => {
        setLoadingProgress(95);
        setLoadingStageText('Generating official agronomist prescription & report...');
      }, 3500);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isSubmitting]);

  const handleSubmit = async () => {
    if (!selectedCrop) {
      toast.error("Please select a crop.");
      return;
    }
    if (symptoms.length === 0) {
      toast.error("Please select at least 1 symptom.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await diagnoseApi.submitDiagnosis({
        crop: selectedCrop,
        growthStage,
        symptoms,
        images
      });
      
      setLoadingProgress(100);
      setLoadingStageText('AI Crop Scan Complete! Opening report...');

      await new Promise((res) => setTimeout(res, 400));
      toast.success("AI Crop Diagnosis Completed!");
      navigate(`/diagnose/${result.id}`);
    } catch (e: any) {
      if (e.response?.status === 429) {
        toast.error("Too many diagnosis requests! Please wait 1 minute before trying again.");
      } else {
        toast.error(e.response?.data?.message || "Failed to run diagnosis.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
      
      {/* FULL COMPONENT AI DIAGNOSTIC SCANNING LOADING SCREEN */}
      {isSubmitting ? (
        <div className="py-12 px-4 text-center space-y-8 animate-fade-in my-auto">
          {/* Animated Glowing Radar Scanner Disk */}
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-75" />
            <div className="absolute inset-2 bg-emerald-500/30 rounded-full animate-pulse" />
            
            <div className="relative w-32 h-32 rounded-3xl bg-slate-900 border-2 border-emerald-400 flex items-center justify-center shadow-2xl text-emerald-400 overflow-hidden">
              {images && images.length > 0 ? (
                <img src={images[0]} alt="Crop Leaf Scan" className="w-full h-full object-cover opacity-80" />
              ) : (
                <Stethoscope className="w-14 h-14 text-emerald-400 animate-bounce" />
              )}
              {/* Laser Scanner Line Animation */}
              <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981] animate-laser-scan" />
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2 max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              <span>Dr. Krishi AI Vision Engine</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Analyzing {selectedCrop} Crop Health
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Processing leaf pathology, disease vectors & selecting store remedies
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-slate-300">
              <span className="truncate pr-2">{loadingStageText}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm shrink-0">{loadingProgress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>

          {/* Realtime Diagnostic Stage Badges */}
          <div className="max-w-md mx-auto bg-gray-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-700 space-y-3 text-left">
            <div className="flex items-center gap-3 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Crop & Stage: {selectedCrop} ({growthStage})</span>
            </div>
            
            <div className={`flex items-center gap-3 text-xs font-bold transition-opacity ${loadingProgress >= 35 ? 'text-emerald-800 dark:text-emerald-300 opacity-100' : 'text-gray-400 dark:text-slate-500 opacity-50'}`}>
              {loadingProgress >= 35 ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
              <span>Gemini 2.5 Vision Pathology Analysis</span>
            </div>

            <div className={`flex items-center gap-3 text-xs font-bold transition-opacity ${loadingProgress >= 70 ? 'text-emerald-800 dark:text-emerald-300 opacity-100' : 'text-gray-400 dark:text-slate-500 opacity-50'}`}>
              {loadingProgress >= 70 ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Database className="w-4 h-4 text-slate-400 shrink-0" />}
              <span>Matching Inventory Bio-Fungicides & Treatments</span>
            </div>

            <div className={`flex items-center gap-3 text-xs font-bold transition-opacity ${loadingProgress >= 95 ? 'text-emerald-800 dark:text-emerald-300 opacity-100' : 'text-gray-400 dark:text-slate-500 opacity-50'}`}>
              {loadingProgress >= 95 ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />}
              <span>Generating Agronomist Prescription Ticket</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Header & Step Bar */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">AI Crop Disease & Nutrient Diagnosis</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">Detect fungal, insect, and deficiency issues in under 10 seconds</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {['Crop & Stage', 'Symptoms', 'Photos', 'Review'].map((label, i) => (
                <div key={i} className="space-y-1">
                  <div className={`h-2 rounded-full transition-all ${
                    step >= i + 1 ? 'bg-emerald-600' : 'bg-gray-100 dark:bg-slate-800'
                  }`} />
                  <span className={`text-[10px] font-bold block ${step >= i + 1 ? 'text-emerald-800 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: CROP & GROWTH STAGE */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">1. Select Your Crop</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CROPS_LIST.map((c) => (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => setSelectedCrop(c.name)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        selectedCrop === c.name
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{c.icon}</span>
                      <span className="text-xs">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">2. Current Growth Stage</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GROWTH_STAGES.map((stage) => (
                    <button
                      type="button"
                      key={stage}
                      onClick={() => setGrowthStage(stage)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                        growthStage === stage
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} icon={<ArrowRight className="w-4 h-4" />}>
                  Next: Select Symptoms
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: SYMPTOMS */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Select Observed Leaf or Plant Symptoms</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Choose all that apply to your crop</p>
                <SymptomSelector
                  selectedSymptoms={symptoms}
                  onToggleSymptom={handleToggleSymptom}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} icon={<ArrowRight className="w-4 h-4" />}>
                  Next: Upload Photos
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: PHOTOS */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Upload Close-up Photos</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Clear pictures improve AI accuracy up to 98%</p>
                <ImageUploader
                  images={images}
                  onChangeImages={setImages}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)} icon={<ArrowRight className="w-4 h-4" />}>
                  Next: Review & Submit
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-800 pb-2">
                  Diagnosis Input Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs text-emerald-950 dark:text-emerald-100 font-medium">
                  <div>
                    <span className="text-emerald-700 dark:text-emerald-400 block text-[10px] uppercase font-bold">Target Crop</span>
                    <span className="font-bold">{selectedCrop}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 dark:text-emerald-400 block text-[10px] uppercase font-bold">Growth Stage</span>
                    <span>{growthStage}</span>
                  </div>
                </div>

                <div>
                  <span className="text-emerald-700 dark:text-emerald-400 block text-[10px] uppercase font-bold mb-1">Selected Symptoms</span>
                  <div className="flex flex-wrap gap-1">
                    {symptoms.map((s, idx) => (
                      <span key={idx} className="bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(3)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  className="px-8 bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-lg"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                >
                  Run AI Diagnosis
                </Button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};
