'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  X,
  Upload,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Star,
  FileText,
  Package,
  Plane,
  CheckCircle,
  Car,
  Building,
  AlertCircle,
  Trash2,
  Bed,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';

// Toast notification system
const ToastContext = createContext<{
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
} | null>(null);

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-4 right-4 z-50 max-w-md rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl bg-white/10 ${colors[type]} p-4`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Enums - matching your original code structure
export enum PackageType {
  ACTIVITY = 'ACTIVITY',
  TRANSFERS = 'TRANSFERS',
  MULTI_CITY_PACKAGE = 'MULTI_CITY_PACKAGE',
  MULTI_CITY_PACKAGE_WITH_HOTEL = 'MULTI_CITY_PACKAGE_WITH_HOTEL',
  FIXED_DEPARTURE_WITH_FLIGHT = 'FIXED_DEPARTURE_WITH_FLIGHT'
}

// Interfaces - matching your original code structure  
interface PackageFormData {
  type: PackageType;
  
  // Common fields
  name?: string;
  title?: string;
  place?: string;
  description?: string;
  image?: File | string;
  
  // Transfer specific
  from?: string;
  to?: string;
  
  // Activity specific
  timing?: string;
  durationHours?: number;
  inclusions?: string[];
  exclusions?: string[];
  
  // Package specific
  banner?: File | string;
  additionalNotes?: string;
  tourInclusions?: string[];
  tourExclusions?: string[];
  destinations?: string[];
  days?: number;
  itinerary?: DayItinerary[];
  
  // Hotel specific
  hotels?: HotelInfo[];
  
  // Pricing
  pricing?: PricingInfo[];
}

interface DayItinerary {
  day: number;
  title: string;
  description: string;
  activities: string[];
  highlights: string[];
}

interface HotelInfo {
  name: string;
  location: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
}

interface PricingInfo {
  adultPrice: number;
  childPrice: number;
  validFrom: string;
  validTo: string;
  notes?: string;
}

// Package type selection component
const PackageTypeSelector = ({ onSelect }: { onSelect: (type: PackageType) => void }) => {
  const [selectedType, setSelectedType] = useState<PackageType | null>(null);

  const packageTypes = [
    {
      type: PackageType.TRANSFERS,
      title: 'Transfers',
      description: 'Airport pickups, city transfers, transportation services',
      icon: Car,
      color: 'blue',
      features: ['Point to point', 'Quick setup', 'Simple pricing']
    },
    {
      type: PackageType.ACTIVITY,
      title: 'Activities',
      description: 'Day trips, tours, experiences, adventure activities',
      icon: Star,
      color: 'green',
      features: ['Duration based', 'Inclusions/exclusions', 'Flexible timing']
    },
    {
      type: PackageType.MULTI_CITY_PACKAGE,
      title: 'Multi City Package',
      description: 'Multi-day tours covering multiple destinations',
      icon: Package,
      color: 'purple',
      features: ['Multiple destinations', 'Day-wise itinerary', 'Tour inclusions']
    },
    {
      type: PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL,
      title: 'Multi City + Hotels',
      description: 'Complete packages with accommodation included',
      icon: Building,
      color: 'orange',
      features: ['Hotels included', 'Full packages', 'End-to-end service']
    },
    {
      type: PackageType.FIXED_DEPARTURE_WITH_FLIGHT,
      title: 'Fixed Departure',
      description: 'Pre-scheduled group tours with fixed dates',
      icon: Plane,
      color: 'red',
      features: ['Fixed dates', 'Group tours', 'International flights']
    }
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'selected') => {
    const colorMap: Record<string, Record<string, string>> = {
      blue: { 
        bg: 'bg-blue-50', 
        text: 'text-blue-600', 
        border: 'border-blue-200',
        selected: 'ring-2 ring-blue-500 bg-blue-50 border-blue-300'
      },
      green: { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-600', 
        border: 'border-emerald-200',
        selected: 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-300'
      },
      purple: { 
        bg: 'bg-purple-50', 
        text: 'text-purple-600', 
        border: 'border-purple-200',
        selected: 'ring-2 ring-purple-500 bg-purple-50 border-purple-300'
      },
      orange: { 
        bg: 'bg-orange-50', 
        text: 'text-orange-600', 
        border: 'border-orange-200',
        selected: 'ring-2 ring-orange-500 bg-orange-50 border-orange-300'
      },
      red: { 
        bg: 'bg-red-50', 
        text: 'text-red-600', 
        border: 'border-red-200',
        selected: 'ring-2 ring-red-500 bg-red-50 border-red-300'
      }
    };
    return colorMap[color]?.[type] || 'bg-gray-50';
  };

  const handleSelect = (type: PackageType) => {
    setSelectedType(type);
    setTimeout(() => onSelect(type), 300);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Package</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm">Select the package type that best fits your offering</p>
      </motion.div>
      
      {/* Compact Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packageTypes.map((pkg, index) => {
          const IconComponent = pkg.icon;
          const isSelected = selectedType === pkg.type;
          
          return (
            <motion.div
              key={pkg.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                y: -8, 
                scale: 1.03,
                rotateX: 5,
                rotateY: 2,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.98 }}
              className={`group relative backdrop-blur-xl rounded-3xl border border-white/30 transition-all duration-300 cursor-pointer overflow-hidden ${
                isSelected 
                  ? getColorClasses(pkg.color, 'selected')
                  : 'hover:border-white/50 hover:shadow-2xl'
              }`}
              style={{
                background: isSelected 
                  ? `linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.2) 100%)`
                  : `linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)`,
                boxShadow: isSelected 
                  ? '0 25px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8)'
                  : '0 15px 35px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.07), inset 0 1px 2px rgba(255,255,255,0.6)',
                transformStyle: 'preserve-3d'
              }}
              onClick={() => handleSelect(pkg.type)}
            >
              <div className="p-5">
                {/* Compact Icon and Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`inline-flex p-3 rounded-2xl transition-all duration-300 backdrop-blur-md ${
                    isSelected ? getColorClasses(pkg.color, 'bg') : 'bg-white/50 group-hover:' + getColorClasses(pkg.color, 'bg')
                  }`}
                  style={{
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.7)',
                    transform: 'translateZ(10px)'
                  }}>
                    <IconComponent className={`w-4 h-4 transition-colors duration-300 ${
                      isSelected ? getColorClasses(pkg.color, 'text') : 'text-gray-500 group-hover:' + getColorClasses(pkg.color, 'text')
                    }`} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{pkg.title}</h3>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`ml-auto p-1 rounded-full backdrop-blur-sm ${getColorClasses(pkg.color, 'bg')}`}
                      style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                      }}
                    >
                      <Check className={`w-2.5 h-2.5 ${getColorClasses(pkg.color, 'text')}`} />
                    </motion.div>
                  )}
                </div>
                
                {/* Compact Description */}
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">{pkg.description}</p>
                
                {/* Compact Features */}
                <div className="space-y-1.5">
                  {(pkg.features || []).map((feature, featureIndex) => (
                    <motion.div 
                      key={featureIndex} 
                      className="flex items-center text-xs text-gray-500"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.1) + (featureIndex * 0.05) }}
                    >
                      <div className={`w-1 h-1 rounded-full mr-2 transition-colors duration-300 ${
                        isSelected ? getColorClasses(pkg.color, 'text').replace('text-', 'bg-') : 'bg-gray-300'
                      }`} />
                      {feature}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced form components
interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  description?: string;
}

const FormField = ({ label, required = false, children, error, description }: FormFieldProps) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 text-xs">*</span>}
    </label>
    {description && (
      <p className="text-xs text-gray-500">{description}</p>
    )}
    {children}
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center text-red-600 text-xs"
        >
          <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

interface InputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const Input = ({ placeholder, value, onChange, type = "text", error, ...props }: InputProps) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full px-4 py-3 text-sm border border-white/40 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 backdrop-blur-md ${
      error ? 'border-red-300/70 bg-red-50/30' : 'bg-white/30 hover:bg-white/50 focus:bg-white/60'
    }`}
    style={{
      boxShadow: error 
        ? '0 8px 25px rgba(239,68,68,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
        : '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
    }}
    {...props}
  />
);

interface TextareaProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  error?: string;
}

const Textarea = ({ placeholder, value, onChange, rows = 3, error }: TextareaProps) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    className={`w-full px-4 py-3 text-sm border border-white/40 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 backdrop-blur-md resize-none ${
      error ? 'border-red-300/70 bg-red-50/30' : 'bg-white/30 hover:bg-white/50 focus:bg-white/60'
    }`}
    style={{
      boxShadow: error 
        ? '0 8px 25px rgba(239,68,68,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
        : '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
    }}
  />
);

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
}

const Select = ({ value, onChange, options, placeholder, error }: SelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full px-4 py-3 text-sm border border-white/40 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 backdrop-blur-md ${
      error ? 'border-red-300/70 bg-red-50/30' : 'bg-white/30 hover:bg-white/50 focus:bg-white/60'
    }`}
    style={{
      boxShadow: error 
        ? '0 8px 25px rgba(239,68,68,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
        : '0 8px 25px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)'
    }}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

interface ImageUploadProps {
  onUpload: (file: File) => void;
  preview?: string | File;
  label?: string;
}

const ImageUpload = ({ onUpload, preview, label = "Upload Image" }: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  
  const previewUrl = typeof preview === 'string' ? preview : 
                     preview instanceof File ? URL.createObjectURL(preview) : '';

  return (
    <div 
      className={`relative border-2 border-dashed border-white/30 rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer group backdrop-blur-sm ${
        dragOver ? 'border-blue-400/50 bg-blue-50/20' : 'hover:border-white/50 hover:bg-white/10'
      }`}
      style={{
        background: dragOver 
          ? 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        boxShadow: dragOver 
          ? '0 8px 32px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          : '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          onUpload(file);
        }
      }}
    >
      {previewUrl ? (
        <div className="relative">
          <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-xl shadow-md" />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Handle remove logic here if needed
            }}
            className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`inline-flex p-3 rounded-xl transition-colors backdrop-blur-sm ${
            dragOver ? 'bg-blue-100/30' : 'bg-white/20 group-hover:bg-blue-50/30'
          }`}
          style={{
            boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
            <Upload className={`w-6 h-6 transition-colors ${
              dragOver ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'
            }`} />
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1 text-sm">{label}</p>
            <p className="text-xs text-gray-500">Drag & drop or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
          </div>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};

interface ListManagerProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  title?: string;
}

const ListManager = ({ items, onChange, placeholder, title }: ListManagerProps) => {
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
      setIsAdding(false);
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {title && <h4 className="font-medium text-gray-900">{title}</h4>}
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 backdrop-blur-sm rounded-xl transition-colors border border-blue-200/30"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
            boxShadow: '0 4px 16px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          <Plus className="w-4 h-4" />
          Add {title || 'Item'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <Input
              placeholder={placeholder}
              value={newItem}
              onChange={setNewItem}
              onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && addItem()}
            />
            <button
              onClick={addItem}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors flex-shrink-0 backdrop-blur-sm"
              style={{
                boxShadow: '0 4px 16px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewItem('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {items.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={`${item}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between backdrop-blur-sm px-4 py-3 rounded-xl group border border-white/20"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                <span className="text-sm text-gray-700 flex-1">{item}</span>
                <button
                  onClick={() => removeItem(index)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

interface PricingSectionProps {
  pricing: PricingInfo[];
  onChange: (pricing: PricingInfo[]) => void;
}

const PricingSection = ({ pricing, onChange }: PricingSectionProps) => {
  const addPricing = () => {
    onChange([
      ...(pricing || []),
      { adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }
    ]);
  };

  const updatePricing = (index: number, field: keyof PricingInfo, value: any) => {
    const updated = [...(pricing || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePricing = (index: number) => {
    onChange((pricing || []).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">Pricing Information</h4>
        <button
          onClick={addPricing}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 backdrop-blur-sm rounded-xl transition-colors border border-blue-200/30"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)',
            boxShadow: '0 4px 16px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
        >
          <Plus className="w-4 h-4" />
          Add Price Slab
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {(pricing || []).map((price, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="backdrop-blur-xl border border-white/20 rounded-2xl p-5 space-y-4"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.05) 100%)',
                boxShadow: '0 8px 32px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <div className="flex justify-between items-center">
                <h5 className="font-semibold text-gray-900">Price Slab {index + 1}</h5>
                {pricing.length > 1 && (
                  <button
                    onClick={() => removePricing(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Adult Price" required>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={price.adultPrice.toString()}
                      onChange={(value) => updatePricing(index, 'adultPrice', parseFloat(value) || 0)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </FormField>
                <FormField label="Child Price">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={price.childPrice.toString()}
                      onChange={(value) => updatePricing(index, 'childPrice', parseFloat(value) || 0)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Valid From" required>
                  <Input
                    type="date"
                    value={price.validFrom}
                    onChange={(value) => updatePricing(index, 'validFrom', value)}
                  />
                </FormField>
                <FormField label="Valid To" required>
                  <Input
                    type="date"
                    value={price.validTo}
                    onChange={(value) => updatePricing(index, 'validTo', value)}
                  />
                </FormField>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Package type specific forms
interface FormProps {
  data: PackageFormData;
  onChange: (data: Partial<PackageFormData>) => void;
}

const TransferForm = ({ data, onChange }: FormProps) => {
  const places = [
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'goa', label: 'Goa' },
    { value: 'kerala', label: 'Kerala' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/50 backdrop-blur-sm rounded-xl mb-2 border border-blue-200/30"
        style={{
          boxShadow: '0 4px 16px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
          <Car className="w-4 h-4 text-blue-600" />
          <span className="text-blue-600 font-medium text-sm">Transfer Service</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Transfer Details</h2>
        <p className="text-gray-600 text-sm">Create your transfer service offering</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl rounded-2xl border border-white/20 p-5 space-y-5"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-3">
            <FormField 
              label="Transfer Name" 
              required
              description="Give your transfer service a descriptive name"
            >
              <Input
                placeholder="e.g., Airport to Hotel Transfer"
                value={data.name || ''}
                onChange={(value) => onChange({ name: value })}
              />
            </FormField>

            <FormField 
              label="City/Place" 
              required
              description="Select the city where this transfer operates"
            >
              <Select
                value={data.place || ''}
                onChange={(value) => onChange({ place: value })}
                options={places}
                placeholder="Select city"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="From" required>
                <Input
                  placeholder="Starting location"
                  value={data.from || ''}
                  onChange={(value) => onChange({ from: value })}
                />
              </FormField>
              <FormField label="To" required>
                <Input
                  placeholder="Destination"
                  value={data.to || ''}
                  onChange={(value) => onChange({ to: value })}
                />
              </FormField>
            </div>
          </div>

          <div className="space-y-4">
            <FormField 
              label="Service Description"
              description="Describe what makes your transfer service special"
            >
              <Textarea
                placeholder="Describe your transfer service, vehicle types, amenities, etc."
                value={data.description || ''}
                onChange={(value) => onChange({ description: value })}
                rows={6}
              />
            </FormField>

            <FormField label="Transfer Image">
              <ImageUpload
                onUpload={(file) => onChange({ image: file })}
                preview={data.image}
                label="Upload Transfer Image"
              />
            </FormField>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <PricingSection
            pricing={data.pricing || [{ adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }]}
            onChange={(pricing) => onChange({ pricing })}
          />
        </div>
      </motion.div>
    </div>
  );
};

const ActivityForm = ({ data, onChange }: FormProps) => {
  const places = [
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'goa', label: 'Goa' },
    { value: 'kerala', label: 'Kerala' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50/50 backdrop-blur-sm rounded-xl mb-2 border border-emerald-200/30"
        style={{
          boxShadow: '0 4px 16px rgba(16,185,129,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
          <Star className="w-4 h-4 text-emerald-600" />
          <span className="text-emerald-600 font-medium text-sm">Activity Experience</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Activity Details</h2>
        <p className="text-gray-600 text-sm">Create your activity or experience offering</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl rounded-2xl border border-white/20 p-5 space-y-5"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-3">
            <FormField 
              label="Activity Name" 
              required
              description="Give your activity a compelling name"
            >
              <Input
                placeholder="e.g., Mumbai City Walking Tour"
                value={data.name || ''}
                onChange={(value) => onChange({ name: value })}
              />
            </FormField>

            <FormField 
              label="Destination" 
              required
              description="Where does this activity take place?"
            >
              <Select
                value={data.place || ''}
                onChange={(value) => onChange({ place: value })}
                options={places}
                placeholder="Select destination"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Timing" required>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="9:00 AM - 5:00 PM"
                    value={data.timing || ''}
                    onChange={(value) => onChange({ timing: value })}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </FormField>
              <FormField label="Duration (Hours)" required>
                <Input
                  type="number"
                  placeholder="8"
                  value={data.durationHours?.toString() || ''}
                  onChange={(value) => onChange({ durationHours: parseInt(value) || 0 })}
                />
              </FormField>
            </div>
          </div>

          <div className="space-y-4">
            <FormField 
              label="Activity Description"
              description="Describe what makes this experience special"
            >
              <Textarea
                placeholder="Describe your activity, what guests will experience, highlights..."
                value={data.description || ''}
                onChange={(value) => onChange({ description: value })}
                rows={6}
              />
            </FormField>

            <FormField label="Activity Image">
              <ImageUpload
                onUpload={(file) => onChange({ image: file })}
                preview={data.image}
                label="Upload Activity Image"
              />
            </FormField>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ListManager
            items={data.inclusions || []}
            onChange={(inclusions) => onChange({ inclusions })}
            placeholder="Add what's included..."
            title="Inclusions"
          />

          <ListManager
            items={data.exclusions || []}
            onChange={(exclusions) => onChange({ exclusions })}
            placeholder="Add what's not included..."
            title="Exclusions"
          />
        </div>

        <div className="border-t border-gray-200 pt-8">
          <PricingSection
            pricing={data.pricing || [{ adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }]}
            onChange={(pricing) => onChange({ pricing })}
          />
        </div>
      </motion.div>
    </div>
  );
};

const MultiCityPackageForm = ({ data, onChange }: FormProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'destinations' | 'itinerary' | 'pricing'>('overview');

  const addItineraryDay = () => {
    const newDay: DayItinerary = {
      day: (data.itinerary?.length || 0) + 1,
      title: '',
      description: '',
      activities: [],
      highlights: []
    };
    onChange({ itinerary: [...(data.itinerary || []), newDay] });
  };

  const updateItineraryDay = (index: number, updates: Partial<DayItinerary>) => {
    const updated = [...(data.itinerary || [])];
    updated[index] = { ...updated[index], ...updates };
    onChange({ itinerary: updated });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'pricing', label: 'Pricing', icon: DollarSign }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-50 rounded-full mb-4">
          <Package className="w-5 h-5 text-purple-600" />
          <span className="text-purple-600 font-medium">Multi City Package</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Multi City Package</h2>
        <p className="text-gray-600 text-lg">Create your comprehensive tour package</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
      >
        <div className="border-b border-gray-200 bg-gray-50/50">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-6 py-4 border-b-3 font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <FormField 
                      label="Package Title" 
                      required
                      description="Give your package an attractive title"
                    >
                      <Input
                        placeholder="e.g., Golden Triangle Tour"
                        value={data.title || ''}
                        onChange={(value) => onChange({ title: value })}
                      />
                    </FormField>

                    <FormField 
                      label="Package Description"
                      description="Describe what makes this package special"
                    >
                      <Textarea
                        placeholder="Describe your package, highlights, what travelers will experience..."
                        value={data.description || ''}
                        onChange={(value) => onChange({ description: value })}
                        rows={6}
                      />
                    </FormField>

                    <FormField label="Additional Notes">
                      <Textarea
                        placeholder="Any additional information for travelers..."
                        value={data.additionalNotes || ''}
                        onChange={(value) => onChange({ additionalNotes: value })}
                        rows={4}
                      />
                    </FormField>
                  </div>

                  <div className="space-y-6">
                    <FormField label="Banner Image">
                      <ImageUpload
                        onUpload={(file) => onChange({ banner: file })}
                        preview={data.banner}
                        label="Upload Package Banner"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
                  <ListManager
                    items={data.tourInclusions || []}
                    onChange={(tourInclusions) => onChange({ tourInclusions })}
                    placeholder="Add tour inclusion..."
                    title="Tour Inclusions"
                  />

                  <ListManager
                    items={data.tourExclusions || []}
                    onChange={(tourExclusions) => onChange({ tourExclusions })}
                    placeholder="Add tour exclusion..."
                    title="Tour Exclusions"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'destinations' && (
              <motion.div
                key="destinations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Package Destinations</h3>
                  <p className="text-gray-600">Add all the destinations included in this package</p>
                </div>
                
                <ListManager
                  items={data.destinations || []}
                  onChange={(destinations) => onChange({ destinations })}
                  placeholder="Add destination city..."
                  title="Destinations"
                />
              </motion.div>
            )}

            {activeTab === 'itinerary' && (
              <motion.div
                key="itinerary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Day-wise Itinerary</h3>
                    <p className="text-gray-600 mt-1">Plan each day of your package</p>
                  </div>
                  <button
                    onClick={addItineraryDay}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Add Day
                  </button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {(data.itinerary || []).map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {day.day}
                            </div>
                            <h4 className="font-semibold text-gray-900">Day {day.day}</h4>
                          </div>
                          <button
                            onClick={() => {
                              const updated = (data.itinerary || []).filter((_, i) => i !== index);
                              onChange({ itinerary: updated });
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <FormField label="Day Title">
                            <Input
                              placeholder="e.g., Arrival in Delhi"
                              value={day.title}
                              onChange={(value) => updateItineraryDay(index, { title: value })}
                            />
                          </FormField>

                          <FormField label="Day Description">
                            <Textarea
                              placeholder="Describe the day's activities and experiences..."
                              value={day.description}
                              onChange={(value) => updateItineraryDay(index, { description: value })}
                              rows={3}
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <ListManager
                            items={day.activities}
                            onChange={(activities) => updateItineraryDay(index, { activities })}
                            placeholder="Add activity..."
                            title="Activities"
                          />

                          <ListManager
                            items={day.highlights}
                            onChange={(highlights) => updateItineraryDay(index, { highlights })}
                            placeholder="Add highlight..."
                            title="Highlights"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {(!data.itinerary || data.itinerary.length === 0) && (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No itinerary days added yet. Click "Add Day" to start planning.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'pricing' && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Package Pricing</h3>
                  <p className="text-gray-600">Set competitive prices for your package</p>
                </div>
                
                <PricingSection
                  pricing={data.pricing || [{ adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }]}
                  onChange={(pricing) => onChange({ pricing })}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const MultiCityPackageWithHotelForm = ({ data, onChange }: FormProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'destinations' | 'itinerary' | 'hotels' | 'pricing'>('overview');

  const addHotel = () => {
    const newHotel: HotelInfo = {
      name: '',
      location: '',
      checkIn: '',
      checkOut: '',
      roomType: ''
    };
    onChange({ hotels: [...(data.hotels || []), newHotel] });
  };

  const updateHotel = (index: number, updates: Partial<HotelInfo>) => {
    const updated = [...(data.hotels || [])];
    updated[index] = { ...updated[index], ...updates };
    onChange({ hotels: updated });
  };

  const addItineraryDay = () => {
    const newDay: DayItinerary = {
      day: (data.itinerary?.length || 0) + 1,
      title: '',
      description: '',
      activities: [],
      highlights: []
    };
    onChange({ itinerary: [...(data.itinerary || []), newDay] });
  };

  const updateItineraryDay = (index: number, updates: Partial<DayItinerary>) => {
    const updated = [...(data.itinerary || [])];
    updated[index] = { ...updated[index], ...updates };
    onChange({ itinerary: updated });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'hotels', label: 'Hotels', icon: Bed },
    { id: 'pricing', label: 'Pricing', icon: DollarSign }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-orange-50 rounded-full mb-4">
          <Building className="w-5 h-5 text-orange-600" />
          <span className="text-orange-600 font-medium">Complete Package</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Multi City Package + Hotels</h2>
        <p className="text-gray-600 text-lg">Create your complete package with accommodation</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
      >
        <div className="border-b border-gray-200 bg-gray-50/50">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-6 py-4 border-b-3 font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <FormField 
                      label="Package Title" 
                      required
                      description="Give your complete package an attractive title"
                    >
                      <Input
                        placeholder="e.g., Golden Triangle Tour with Luxury Hotels"
                        value={data.title || ''}
                        onChange={(value) => onChange({ title: value })}
                      />
                    </FormField>

                    <FormField 
                      label="Package Description"
                      description="Highlight accommodation and tour features"
                    >
                      <Textarea
                        placeholder="Describe your complete package including hotels, activities, and experiences..."
                        value={data.description || ''}
                        onChange={(value) => onChange({ description: value })}
                        rows={6}
                      />
                    </FormField>
                  </div>

                  <div className="space-y-6">
                    <FormField label="Package Banner">
                      <ImageUpload
                        onUpload={(file) => onChange({ banner: file })}
                        preview={data.banner}
                        label="Upload Package Banner"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
                  <ListManager
                    items={data.tourInclusions || []}
                    onChange={(tourInclusions) => onChange({ tourInclusions })}
                    placeholder="Add tour inclusion..."
                    title="Tour Inclusions"
                  />

                  <ListManager
                    items={data.tourExclusions || []}
                    onChange={(tourExclusions) => onChange({ tourExclusions })}
                    placeholder="Add tour exclusion..."
                    title="Tour Exclusions"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'destinations' && (
              <motion.div
                key="destinations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Package Destinations</h3>
                  <p className="text-gray-600">Add all destinations with accommodation</p>
                </div>
                
                <ListManager
                  items={data.destinations || []}
                  onChange={(destinations) => onChange({ destinations })}
                  placeholder="Add destination city..."
                  title="Destinations"
                />
              </motion.div>
            )}

            {activeTab === 'itinerary' && (
              <motion.div
                key="itinerary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Day-wise Itinerary</h3>
                    <p className="text-gray-600 mt-1">Plan each day including accommodation</p>
                  </div>
                  <button
                    onClick={addItineraryDay}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Add Day
                  </button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {(data.itinerary || []).map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {day.day}
                            </div>
                            <h4 className="font-semibold text-gray-900">Day {day.day}</h4>
                          </div>
                          <button
                            onClick={() => {
                              const updated = (data.itinerary || []).filter((_, i) => i !== index);
                              onChange({ itinerary: updated });
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <FormField label="Day Title">
                            <Input
                              placeholder="e.g., Arrival in Delhi"
                              value={day.title}
                              onChange={(value) => updateItineraryDay(index, { title: value })}
                            />
                          </FormField>

                          <FormField label="Day Description">
                            <Textarea
                              placeholder="Describe the day's activities, hotel check-in, etc..."
                              value={day.description}
                              onChange={(value) => updateItineraryDay(index, { description: value })}
                              rows={3}
                            />
                          </FormField>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 'hotels' && (
              <motion.div
                key="hotels"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Hotel Details</h3>
                    <p className="text-gray-600 mt-1">Add accommodation details for each location</p>
                  </div>
                  <button
                    onClick={addHotel}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Add Hotel
                  </button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {(data.hotels || []).map((hotel, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              <Bed className="w-4 h-4" />
                            </div>
                            <h4 className="font-semibold text-gray-900">Hotel {index + 1}</h4>
                          </div>
                          <button
                            onClick={() => {
                              const updated = (data.hotels || []).filter((_, i) => i !== index);
                              onChange({ hotels: updated });
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField label="Hotel Name" required>
                            <Input
                              placeholder="e.g., Taj Palace Hotel"
                              value={hotel.name}
                              onChange={(value) => updateHotel(index, { name: value })}
                            />
                          </FormField>
                          <FormField label="Location" required>
                            <Input
                              placeholder="e.g., New Delhi"
                              value={hotel.location}
                              onChange={(value) => updateHotel(index, { location: value })}
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField label="Check-in" required>
                            <Input
                              type="date"
                              value={hotel.checkIn}
                              onChange={(value) => updateHotel(index, { checkIn: value })}
                            />
                          </FormField>
                          <FormField label="Check-out" required>
                            <Input
                              type="date"
                              value={hotel.checkOut}
                              onChange={(value) => updateHotel(index, { checkOut: value })}
                            />
                          </FormField>
                          <FormField label="Room Type" required>
                            <Input
                              placeholder="e.g., Deluxe Room"
                              value={hotel.roomType}
                              onChange={(value) => updateHotel(index, { roomType: value })}
                            />
                          </FormField>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {(!data.hotels || data.hotels.length === 0) && (
                    <div className="text-center py-12 text-gray-500">
                      <Bed className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No hotels added yet. Click "Add Hotel" to include accommodation.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'pricing' && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Package Pricing (Including Hotels)</h3>
                  <p className="text-gray-600">Set pricing for your complete package with accommodation</p>
                </div>
                
                <PricingSection
                  pricing={data.pricing || [{ adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }]}
                  onChange={(pricing) => onChange({ pricing })}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const FixedDepartureForm = ({ data, onChange }: FormProps) => {
  const [activeStep, setActiveStep] = useState(0);

  const addDestination = () => {
    onChange({ destinations: [...(data.destinations || []), ''] });
  };

  const updateDestination = (index: number, value: string) => {
    const updated = [...(data.destinations || [])];
    updated[index] = value;
    onChange({ destinations: updated });
  };

  const removeDestination = (index: number) => {
    const updated = (data.destinations || []).filter((_, i) => i !== index);
    onChange({ destinations: updated });
  };

  const addItineraryDay = () => {
    const newDay: DayItinerary = {
      day: (data.itinerary?.length || 0) + 1,
      title: '',
      description: '',
      activities: [],
      highlights: []
    };
    onChange({ itinerary: [...(data.itinerary || []), newDay] });
  };

  const updateItineraryDay = (index: number, updates: Partial<DayItinerary>) => {
    const updated = [...(data.itinerary || [])];
    updated[index] = { ...updated[index], ...updates };
    onChange({ itinerary: updated });
  };

  const steps = [
    { title: 'Basic Info', icon: FileText },
    { title: 'Destinations', icon: MapPin },
    { title: 'Itinerary', icon: Calendar },
    { title: 'Pricing', icon: DollarSign }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-50 rounded-full mb-4">
          <Plane className="w-5 h-5 text-red-600" />
          <span className="text-red-600 font-medium">Fixed Departure</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Fixed Departure Package</h2>
        <p className="text-gray-600 text-lg">Create your pre-scheduled group tour with fixed dates</p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            
            return (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => setActiveStep(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg'
                      : isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {step.title}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
                    index < activeStep ? 'bg-green-400' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8"
      >
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <FormField 
                    label="Package Title" 
                    required
                    description="Create an attractive title for your fixed departure"
                  >
                    <Input
                      placeholder="e.g., 15-Day Incredible India Tour"
                      value={data.title || ''}
                      onChange={(value) => onChange({ title: value })}
                    />
                  </FormField>

                  <FormField 
                    label="Number of Days" 
                    required
                    description="How many days does this tour last?"
                  >
                    <Input
                      type="number"
                      placeholder="15"
                      value={data.days?.toString() || ''}
                      onChange={(value) => onChange({ days: parseInt(value) || 0 })}
                    />
                  </FormField>

                  <FormField 
                    label="Package Description"
                    description="Describe what makes this departure special"
                  >
                    <Textarea
                      placeholder="Describe your fixed departure package, highlights, group size, etc..."
                      value={data.description || ''}
                      onChange={(value) => onChange({ description: value })}
                      rows={6}
                    />
                  </FormField>
                </div>

                <div className="space-y-6">
                  <FormField label="Package Image">
                    <ImageUpload
                      onUpload={(file) => onChange({ image: file })}
                      preview={data.image}
                      label="Upload Package Image"
                    />
                  </FormField>
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="destinations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tour Destinations</h3>
                <p className="text-gray-600">Add all destinations included in this fixed departure</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Destinations List</h4>
                  <button
                    onClick={addDestination}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Destination
                  </button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {(data.destinations || []).map((destination, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-3 items-center"
                      >
                        <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <Input
                          placeholder="Enter destination name"
                          value={destination}
                          onChange={(value) => updateDestination(index, value)}
                        />
                        <button
                          onClick={() => removeDestination(index)}
                          className="px-3 py-2 text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {(!data.destinations || data.destinations.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No destinations added yet. Click "Add Destination" to start.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Day-wise Itinerary</h3>
                  <p className="text-gray-600 mt-1">Plan each day of your fixed departure</p>
                </div>
                <button
                  onClick={addItineraryDay}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add Day
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {(data.itinerary || []).map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {day.day}
                          </div>
                          <h4 className="font-semibold text-gray-900">Day {day.day}</h4>
                        </div>
                        <button
                          onClick={() => {
                            const updated = (data.itinerary || []).filter((_, i) => i !== index);
                            onChange({ itinerary: updated });
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <FormField label="Day Summary">
                          <Input
                            placeholder="e.g., Arrival in Delhi - City Tour"
                            value={day.title}
                            onChange={(value) => updateItineraryDay(index, { title: value })}
                          />
                        </FormField>

                        <FormField label="Day Details">
                          <Textarea
                            placeholder="Describe the day's activities, meals, accommodation, etc..."
                            value={day.description}
                            onChange={(value) => updateItineraryDay(index, { description: value })}
                            rows={4}
                          />
                        </FormField>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {(!data.itinerary || data.itinerary.length === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No itinerary days added yet. Click "Add Day" to start planning.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fixed Departure Pricing</h3>
                <p className="text-gray-600">Set pricing for your complete package with fixed dates</p>
              </div>
              
              <PricingSection
                pricing={data.pricing || [{ adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }]}
                onChange={(pricing) => onChange({ pricing })}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === activeStep ? 'bg-red-600' : index < activeStep ? 'bg-green-400' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
            disabled={activeStep === steps.length - 1}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Inner component that uses toast
function CompactPackageWizardContent() {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<PackageType | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({} as PackageFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleTypeSelect = (type: PackageType) => {
    setSelectedType(type);
    setFormData({ 
      type, 
      pricing: [{ adultPrice: 0, childPrice: 0, validFrom: '', validTo: '' }],
      inclusions: [],
      exclusions: [],
      tourInclusions: [],
      tourExclusions: [],
      destinations: [],
      itinerary: [],
      hotels: []
    });
    setStep('form');
    addToast('Package type selected! Let\'s create your offering.', 'success');
  };

  const updateFormData = (updates: Partial<PackageFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors when user makes changes
    if (errors) {
      const newErrors = { ...errors };
      Object.keys(updates).forEach(key => {
        delete newErrors[key];
      });
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name && !formData.title) {
      newErrors.name = 'Name/Title is required';
    }

    // Type-specific validation
    if (formData.type === PackageType.TRANSFERS) {
      if (!formData.place) newErrors.place = 'Place is required';
      if (!formData.from) newErrors.from = 'Starting location is required';
      if (!formData.to) newErrors.to = 'Destination is required';
    }

    if (formData.type === PackageType.ACTIVITY) {
      if (!formData.place) newErrors.place = 'Destination is required';
      if (!formData.timing) newErrors.timing = 'Timing is required';
      if (!formData.durationHours) newErrors.duration = 'Duration is required';
    }

    if (formData.type === PackageType.FIXED_DEPARTURE_WITH_FLIGHT) {
      if (!formData.days) newErrors.days = 'Number of days is required';
      if (!formData.destinations || formData.destinations.length === 0) {
        newErrors.destinations = 'At least one destination is required';
      }
    }

    // Pricing validation
    if (!formData.pricing || formData.pricing.length === 0) {
      newErrors.pricing = 'At least one pricing slab is required';
    } else {
      formData.pricing.forEach((price, index) => {
        if (!price.adultPrice || price.adultPrice <= 0) {
          newErrors[`pricing_${index}_adult`] = 'Adult price is required';
        }
        if (!price.validFrom) {
          newErrors[`pricing_${index}_from`] = 'Valid from date is required';
        }
        if (!price.validTo) {
          newErrors[`pricing_${index}_to`] = 'Valid to date is required';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status: 'DRAFT' | 'ACTIVE' = 'DRAFT') => {
    if (!validateForm()) {
      addToast('Please fix the errors before saving', 'error');
      return;
    }

    setIsSaving(true);
    try {
      console.log('🚀 Starting package save process...');
      console.log('📋 Form data:', formData);
      console.log('📝 Package status:', status);

      // 1) Get current user and tour_operator_id
      console.log('🔐 Getting current user...');
      const { data: authData } = await supabase.auth.getUser();
      const authUserId = authData.user?.id;
      console.log('👤 Auth user ID:', authUserId);
      if (!authUserId) throw new Error('Not authenticated');

      console.log('🏢 Looking up tour operator for user:', authUserId);
      const { data: tourOperator, error: tourOpErr } = await supabase
        .from('tour_operators')
        .select('id')
        .eq('user_id', authUserId)
        .maybeSingle();
      console.log('🏢 Tour operator lookup result:', { tourOperator, error: tourOpErr });
      if (tourOpErr) throw tourOpErr;
      if (!tourOperator?.id) throw new Error('No tour operator profile found');

      // 2) Insert main package
      console.log('📦 Preparing main package insert...');
      const mainInsert = {
        tour_operator_id: tourOperator.id,
        title: formData.title || formData.name || 'Untitled Package',
        description: formData.description || '',
        type: formData.type,
        adult_price: formData.pricing?.[0]?.adultPrice ?? 0,
        child_price: formData.pricing?.[0]?.childPrice ?? 0,
        duration_days: formData.days ?? 1,
        duration_hours: formData.durationHours ?? 0,
        status: status
      } as const;
      console.log('📦 Main insert data:', mainInsert);

      console.log('💾 Inserting main package...');
      const { data: pkgInsert, error: pkgErr } = await supabase
        .from('packages')
        .insert(mainInsert)
        .select('id')
        .single();
      console.log('💾 Package insert result:', { pkgInsert, error: pkgErr });
      if (pkgErr) throw pkgErr;
      const packageId = pkgInsert.id as string;

      if (!packageId) {
        throw new Error('Package was not created. No ID returned from database.');
      }
      console.log('✅ Package ID obtained:', packageId);

      // Verify insert exists (defensive check vs RLS or triggers)
      console.log('🔍 Verifying package exists...');
      const { data: verifyPkg, error: verifyErr } = await supabase
        .from('packages')
        .select('id')
        .eq('id', packageId)
        .maybeSingle();
      console.log('🔍 Verification result:', { verifyPkg, error: verifyErr });
      if (verifyErr) throw verifyErr;
      if (!verifyPkg?.id) {
        throw new Error('Package creation verification failed. Check RLS permissions and schema.');
      }

      // Continue with the rest of your save logic...
      
      const successMessage = status === 'ACTIVE' 
        ? 'Package created and published successfully!' 
        : 'Package saved as draft successfully!';
      addToast(successMessage, 'success');
      router.push('/operator/packages');
      
    } catch (error: any) {
      console.error('💥 CRITICAL ERROR in package save:', error);
      addToast(error?.message || 'Error saving package. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderForm = () => {
    switch (selectedType) {
      case PackageType.TRANSFERS:
        return <TransferForm data={formData} onChange={updateFormData} />;
      case PackageType.ACTIVITY:
        return <ActivityForm data={formData} onChange={updateFormData} />;
      case PackageType.MULTI_CITY_PACKAGE:
        return <MultiCityPackageForm data={formData} onChange={updateFormData} />;
      case PackageType.MULTI_CITY_PACKAGE_WITH_HOTEL:
        return <MultiCityPackageWithHotelForm data={formData} onChange={updateFormData} />;
      case PackageType.FIXED_DEPARTURE_WITH_FLIGHT:
        return <FixedDepartureForm data={formData} onChange={updateFormData} />;
      default:
        return (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Form for {selectedType} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100 relative overflow-hidden">
      {/* Bright animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/40 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-500/30 to-pink-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-emerald-400/25 to-cyan-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-br from-yellow-300/20 to-orange-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-gradient-to-br from-green-400/20 to-teal-500/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
        <AnimatePresence mode="wait">
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4 relative z-10"
            >
              <PackageTypeSelector onSelect={handleTypeSelect} />
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4 relative z-10"
            >
              <div className="max-w-6xl mx-auto px-4 relative z-10">
                {/* Compact Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between mb-4"
                >
                  <button
                    onClick={() => {
                      setStep('type');
                      addToast('Returning to package selection', 'info');
                    }}
                    className="group flex items-center gap-2 px-4 py-2 text-gray-600 backdrop-blur-xl rounded-xl hover:text-gray-900 transition-all duration-200 border border-white/20"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                    <span className="font-medium text-sm">Back</span>
                  </button>
                  
                  <div className="flex items-center gap-6">
                    <AnimatePresence>
                      {Object.keys(errors).length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} to fix
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="flex gap-3">
                      {/* Save Draft Button */}
                      <button
                        onClick={() => handleSave('DRAFT')}
                        disabled={isSaving}
                        className="relative flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
                        style={{
                          boxShadow: '0 6px 24px rgba(75,85,99,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                      >
                        {isSaving ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="font-medium text-sm">Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span className="font-medium text-sm">Save Draft</span>
                          </>
                        )}
                      </button>

                      {/* Submit/Publish Button */}
                      <button
                        onClick={() => handleSave('ACTIVE')}
                        disabled={isSaving}
                        className="relative flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
                        style={{
                          boxShadow: '0 6px 24px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                      >
                        {isSaving ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="font-medium text-sm">Publishing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="font-medium text-sm">Submit & Publish</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>

                {renderForm()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}

// Main wizard component with ToastProvider wrapper
export default function CompactPackageWizard() {
  return (
    <ToastProvider>
      <CompactPackageWizardContent />
    </ToastProvider>
  );
}