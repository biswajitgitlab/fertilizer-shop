import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CROPS_LIST, GROWTH_STAGES } from '../../utils/constants';
import { SymptomSelector } from './SymptomSelector';
import { ImageUploader } from './ImageUploader';
import { Button } from '../common/Button';
import { diagnoseApi } from '../../api/diagnoseApi';
import { Stethoscope, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const DiagnosisWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [growthStage, setGrowthStage] = useState('Flowering & Booting');
  const [symptoms, setSymptoms] = useState<string[]>(['Yellowing Leaves (Chlorosis)', 'Brown / Black Spots']);
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1592417817098-8f3d6eb1626f?auto=format&fit=crop&q=80&w=400"
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleSymptom = (label: string) => {
    if (symptoms.includes(label)) {
      setSymptoms(symptoms.filter(s => s !== label));
    } else {
      setSymptoms([...symptoms, label]);
    }
  };

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
      toast.success("AI Crop Diagnosis Completed!");
      navigate(`/diagnose/${result.id}`);
    } catch (e) {
      toast.error("Failed to run diagnosis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xl space-y-8">
      
      {/* Top Header & Step Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">AI Crop Disease & Nutrient Diagnosis</h2>
            <p className="text-xs text-gray-500">Detect fungal, insect, and deficiency issues in under 10 seconds</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {['Crop & Stage', 'Symptoms', 'Photos', 'Review'].map((label, i) => (
            <div key={i} className="space-y-1">
              <div className={`h-2 rounded-full transition-all ${
                step >= i + 1 ? 'bg-emerald-600' : 'bg-gray-100'
              }`} />
              <span className={`text-[10px] font-bold block ${step >= i + 1 ? 'text-emerald-800' : 'text-gray-400'}`}>
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
            <h3 className="text-sm font-bold text-gray-900 mb-3">1. Select Your Crop</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CROPS_LIST.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => setSelectedCrop(c.name)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    selectedCrop === c.name
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{c.icon}</span>
                  <span className="text-xs">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">2. Current Growth Stage</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GROWTH_STAGES.map((stage) => (
                <button
                  type="button"
                  key={stage}
                  onClick={() => setGrowthStage(stage)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    growthStage === stage
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
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
            <h3 className="text-sm font-bold text-gray-900 mb-1">Select Observed Leaf or Plant Symptoms</h3>
            <p className="text-xs text-gray-500 mb-4">Choose all that apply to your crop</p>
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
            <h3 className="text-sm font-bold text-gray-900 mb-1">Upload Close-up Photos</h3>
            <p className="text-xs text-gray-500 mb-4">Clear pictures improve AI accuracy up to 98%</p>
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
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 space-y-3">
            <h3 className="text-sm font-bold text-emerald-900 border-b border-emerald-200 pb-2">
              Diagnosis Input Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs text-emerald-950 font-medium">
              <div>
                <span className="text-emerald-700 block text-[10px] uppercase font-bold">Target Crop</span>
                <span className="font-bold">{selectedCrop}</span>
              </div>
              <div>
                <span className="text-emerald-700 block text-[10px] uppercase font-bold">Growth Stage</span>
                <span>{growthStage}</span>
              </div>
            </div>

            <div>
              <span className="text-emerald-700 block text-[10px] uppercase font-bold mb-1">Selected Symptoms</span>
              <div className="flex flex-wrap gap-1">
                {symptoms.map((s, idx) => (
                  <span key={idx} className="bg-white text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
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
              className="px-8"
              icon={<CheckCircle2 className="w-5 h-5" />}
            >
              Run AI Diagnosis
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};
