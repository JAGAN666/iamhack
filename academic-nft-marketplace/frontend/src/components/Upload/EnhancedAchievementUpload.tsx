import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  DocumentCheckIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  AcademicCapIcon,
  TrophyIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  ArrowRightIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useEnhancedWallet } from '../../contexts/EnhancedWalletContext';
import { usePerformanceMonitor } from '../../services/performanceMonitor';
import cacheService from '../../services/cacheService';
import toast from 'react-hot-toast';

interface UploadStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface AchievementData {
  title: string;
  description: string;
  category: string;
  courseId: string;
  courseName: string;
  grade: string;
  semester: string;
  year: string;
  university: string;
  professor: string;
  tags: string[];
  files: File[];
  verificationMethod: 'transcript' | 'certificate' | 'recommendation' | 'portfolio';
  metadata?: {
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    skillsGained: string[];
    projectUrl?: string;
    githubUrl?: string;
    linkedinPost?: string;
  };
}

const EnhancedAchievementUpload: React.FC<{
  onSuccess?: (achievementId: string) => void;
  onCancel?: () => void;
}> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { isConnected, chainId, sendTransaction } = useEnhancedWallet();
  const { trackAPI, trackRender } = usePerformanceMonitor();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [achievementData, setAchievementData] = useState<Partial<AchievementData>>({
    tags: [],
    files: [],
    university: user?.university || '',
    year: new Date().getFullYear().toString()
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startTime = useRef(Date.now());

  // Track component render performance
  React.useEffect(() => {
    const renderTime = Date.now() - startTime.current;
    trackRender('EnhancedAchievementUpload', renderTime, { step: currentStep });
  }, [currentStep, trackRender]);

  const steps: UploadStep[] = [
    {
      id: 1,
      title: 'Achievement Details',
      description: 'Tell us about your accomplishment',
      icon: AcademicCapIcon,
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 2,
      title: 'Verification & Evidence',
      description: 'Upload supporting documents',
      icon: ShieldCheckIcon,
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'
    },
    {
      id: 3,
      title: 'Metadata & Skills',
      description: 'Add detailed information',
      icon: LightBulbIcon,
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending'
    },
    {
      id: 4,
      title: 'Review & Submit',
      description: 'Verify and publish',
      icon: CubeIcon,
      status: currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : 'pending'
    }
  ];

  // Smart suggestions based on user input
  const [suggestions, setSuggestions] = useState({
    tags: [] as string[],
    skills: [] as string[],
    categories: [] as string[]
  });

  // Auto-generate suggestions
  React.useEffect(() => {
    if (achievementData.title || achievementData.description) {
      generateSuggestions();
    }
  }, [achievementData.title, achievementData.description, achievementData.courseName]);

  const generateSuggestions = useCallback(async () => {
    const text = `${achievementData.title} ${achievementData.description} ${achievementData.courseName}`.toLowerCase();
    
    // Smart tag suggestions based on content
    const tagSuggestions = [];
    if (text.includes('research')) tagSuggestions.push('research', 'academic-research', 'innovation');
    if (text.includes('project')) tagSuggestions.push('project-management', 'team-collaboration');
    if (text.includes('programming') || text.includes('coding')) tagSuggestions.push('programming', 'software-development', 'technical-skills');
    if (text.includes('presentation')) tagSuggestions.push('public-speaking', 'communication');
    if (text.includes('leadership')) tagSuggestions.push('leadership', 'team-management');
    if (text.includes('design')) tagSuggestions.push('design', 'creativity', 'user-experience');
    if (text.includes('analysis') || text.includes('data')) tagSuggestions.push('data-analysis', 'analytical-thinking');

    // Skill suggestions
    const skillSuggestions = [];
    if (text.includes('javascript')) skillSuggestions.push('JavaScript', 'Web Development');
    if (text.includes('python')) skillSuggestions.push('Python', 'Data Science');
    if (text.includes('machine learning')) skillSuggestions.push('Machine Learning', 'AI/ML');
    if (text.includes('blockchain')) skillSuggestions.push('Blockchain', 'Web3');
    if (text.includes('marketing')) skillSuggestions.push('Digital Marketing', 'Brand Strategy');

    setSuggestions({
      tags: tagSuggestions.filter(tag => !achievementData.tags?.includes(tag)),
      skills: skillSuggestions.filter(skill => !achievementData.metadata?.skillsGained?.includes(skill)),
      categories: ['Academic Excellence', 'Research Achievement', 'Project Completion', 'Skills Certification']
    });
  }, [achievementData.title, achievementData.description, achievementData.courseName, achievementData.tags, achievementData.metadata?.skillsGained]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!achievementData.title) newErrors.title = 'Title is required';
        if (!achievementData.description) newErrors.description = 'Description is required';
        if (!achievementData.category) newErrors.category = 'Category is required';
        if (!achievementData.courseName) newErrors.courseName = 'Course name is required';
        break;
      
      case 2:
        if (!achievementData.verificationMethod) newErrors.verificationMethod = 'Verification method is required';
        if (achievementData.files?.length === 0) newErrors.files = 'At least one supporting document is required';
        break;
      
      case 3:
        if (!achievementData.metadata?.difficulty) newErrors.difficulty = 'Difficulty level is required';
        if (!achievementData.metadata?.skillsGained?.length) newErrors.skillsGained = 'At least one skill must be specified';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFileUpload = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast.error(`${file.name}: Invalid file type`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name}: File too large (max 10MB)`);
        return false;
      }
      
      return true;
    });

    setAchievementData(prev => ({
      ...prev,
      files: [...(prev.files || []), ...validFiles]
    }));

    toast.success(`${validFiles.length} file(s) added successfully`);
  }, []);

  const removeFile = (index: number) => {
    setAchievementData(prev => ({
      ...prev,
      files: prev.files?.filter((_, i) => i !== index) || []
    }));
  };

  const addTag = (tag: string) => {
    if (!achievementData.tags?.includes(tag)) {
      setAchievementData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setAchievementData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const addSkill = (skill: string) => {
    if (!achievementData.metadata?.skillsGained?.includes(skill)) {
      setAchievementData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          skillsGained: [...(prev.metadata?.skillsGained || []), skill]
        }
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    const submitStartTime = Date.now();
    
    try {
      // Simulate file upload progress
      const uploadFiles = async () => {
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      };

      await uploadFiles();

      // Create form data
      const formData = new FormData();
      formData.append('data', JSON.stringify(achievementData));
      achievementData.files?.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      // Submit to API
      const response = await fetch('/api/achievements', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const duration = Date.now() - submitStartTime;
      trackAPI('/api/achievements', 'POST', duration, response.status);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Cache the new achievement
      await cacheService.invalidatePattern('achievements');
      await cacheService.set(`achievement-${result.id}`, result, 600000); // 10 minutes

      toast.success('🎉 Achievement uploaded successfully!');
      
      if (onSuccess) {
        onSuccess(result.id);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload achievement. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achievement Title *
                </label>
                <input
                  type="text"
                  value={achievementData.title || ''}
                  onChange={(e) => setAchievementData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Machine Learning Research Project"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={achievementData.category || ''}
                  onChange={(e) => setAchievementData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select a category</option>
                  {suggestions.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={achievementData.description || ''}
                onChange={(e) => setAchievementData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Describe your achievement in detail..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  value={achievementData.courseName || ''}
                  onChange={(e) => setAchievementData(prev => ({ ...prev, courseName: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 ${errors.courseName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., CS 229"
                />
                {errors.courseName && <p className="mt-1 text-sm text-red-600">{errors.courseName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={achievementData.grade || ''}
                  onChange={(e) => setAchievementData(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select grade</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="Pass">Pass</option>
                  <option value="Distinction">Distinction</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={achievementData.year || ''}
                  onChange={(e) => setAchievementData(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Smart Tag Suggestions */}
            {suggestions.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggested Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestions.tags.slice(0, 8).map(tag => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Tags */}
            {achievementData.tags && achievementData.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {achievementData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-indigo-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Verification Method *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'transcript', title: 'Official Transcript', icon: DocumentCheckIcon },
                  { id: 'certificate', title: 'Certificate', icon: TrophyIcon },
                  { id: 'recommendation', title: 'Recommendation', icon: SparklesIcon },
                  { id: 'portfolio', title: 'Portfolio/Project', icon: ClipboardDocumentIcon }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setAchievementData(prev => ({ ...prev, verificationMethod: method.id as any }))}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      achievementData.verificationMethod === method.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <method.icon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-medium">{method.title}</span>
                  </button>
                ))}
              </div>
              {errors.verificationMethod && <p className="mt-2 text-sm text-red-600">{errors.verificationMethod}</p>}
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Documents *
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  errors.files ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-indigo-400'
                }`}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Support: Images, PDF, Word documents (max 10MB each)
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Choose Files
                </button>
              </div>
              {errors.files && <p className="mt-2 text-sm text-red-600">{errors.files}</p>}
            </div>

            {/* Uploaded Files */}
            {achievementData.files && achievementData.files.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Uploaded Files</h4>
                <div className="space-y-2">
                  {achievementData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <PhotoIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  value={achievementData.metadata?.difficulty || ''}
                  onChange={(e) => setAchievementData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, difficulty: e.target.value as any }
                  }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 ${errors.difficulty ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                {errors.difficulty && <p className="mt-1 text-sm text-red-600">{errors.difficulty}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project URL (optional)
                </label>
                <input
                  type="url"
                  value={achievementData.metadata?.projectUrl || ''}
                  onChange={(e) => setAchievementData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, projectUrl: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Skills Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills Gained *
              </label>
              
              {suggestions.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Suggested skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.skills.slice(0, 6).map(skill => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {achievementData.metadata?.skillsGained && achievementData.metadata.skillsGained.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {achievementData.metadata.skillsGained.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => setAchievementData(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            skillsGained: prev.metadata?.skillsGained?.filter(s => s !== skill) || []
                          }
                        }))}
                        className="ml-2 hover:text-indigo-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : errors.skillsGained && (
                <p className="text-sm text-red-600">{errors.skillsGained}</p>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Preview Toggle */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Review Your Achievement</h3>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </button>
            </div>

            {previewMode ? (
              /* Achievement Preview */
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {achievementData.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                        {achievementData.category}
                      </span>
                      <span>{achievementData.courseName}</span>
                      <span>{achievementData.year}</span>
                      {achievementData.grade && <span>Grade: {achievementData.grade}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Difficulty</div>
                    <div className="font-medium capitalize">{achievementData.metadata?.difficulty}</div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{achievementData.description}</p>

                {achievementData.tags && achievementData.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {achievementData.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white text-gray-700 rounded-full text-xs border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {achievementData.metadata?.skillsGained && achievementData.metadata.skillsGained.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Skills Gained</div>
                    <div className="flex flex-wrap gap-2">
                      {achievementData.metadata.skillsGained.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Summary for Review */
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Title:</span> {achievementData.title}</div>
                  <div><span className="font-medium">Category:</span> {achievementData.category}</div>
                  <div><span className="font-medium">Course:</span> {achievementData.courseName}</div>
                  <div><span className="font-medium">Year:</span> {achievementData.year}</div>
                  <div><span className="font-medium">Verification:</span> {achievementData.verificationMethod}</div>
                  <div><span className="font-medium">Files:</span> {achievementData.files?.length || 0} attached</div>
                  <div><span className="font-medium">Difficulty:</span> {achievementData.metadata?.difficulty}</div>
                  <div><span className="font-medium">Skills:</span> {achievementData.metadata?.skillsGained?.length || 0} listed</div>
                </div>
              </div>
            )}

            {/* Blockchain Integration Notice */}
            {isConnected && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center mb-3">
                  <CubeIcon className="w-6 h-6 text-purple-600 mr-3" />
                  <h4 className="font-bold text-purple-800">Blockchain Integration Ready</h4>
                </div>
                <p className="text-purple-700 text-sm mb-3">
                  Your achievement will be stored on-chain for permanent verification and can be minted as an NFT.
                </p>
                <div className="text-xs text-purple-600">
                  Network: {chainId === 1 ? 'Ethereum' : chainId === 137 ? 'Polygon' : 'Testnet'} • 
                  Gas fees will be estimated before minting
                </div>
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                    step.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : step.status === 'active'
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    React.createElement(step.icon, { className: "w-6 h-6" })
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${step.status === 'active' ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    steps[index + 1].status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
          
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Next Step
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Submit Achievement
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {isSubmitting && uploadProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-indigo-50 rounded-xl p-4 border border-indigo-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-700">Uploading Achievement</span>
              <span className="text-sm text-indigo-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-indigo-200 rounded-full h-2">
              <motion.div
                className="bg-indigo-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedAchievementUpload;