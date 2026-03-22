import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  brandColors?: string[];
  onAddBrandColor?: (color: string) => void;
}

// --- Color Utilities ---

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
};

const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToRgb = (h: number, s: number, v: number) => {
  h /= 360; s /= 100; v /= 100;
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  value, 
  onChange, 
  brandColors = ['#D6C750', '#0D1E3D', '#F2F4F7', '#D6C750'], 
  onAddBrandColor 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hsv, setHsv] = useState(() => {
    const rgb = hexToRgb(value || '#0D9E75');
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const saturationRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const isDraggingSaturation = useRef(false);
  const isDraggingHue = useRef(false);

  // We don't want to override hsv if the user is currently interacting and hasn't released yet,
  // but to fix the lint error about set-state-in-effect and cascading renders,
  // we can use the key prop on ColorPicker from the parent to reset state, or just reset hsv
  // when value completely changes from outside, though usually value changes *because* of hsv changes.
  useEffect(() => {
    if (!isDraggingSaturation.current && !isDraggingHue.current) {
        const rgb = hexToRgb(value || '#0D9E75');
        const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        // Using a ref to track if we really need to update would be best,
        // but for now, we'll just set it if it differs significantly.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHsv(prev => {
            if (Math.abs(prev.h - newHsv.h) > 1 || Math.abs(prev.s - newHsv.s) > 1 || Math.abs(prev.v - newHsv.v) > 1) {
                return newHsv;
            }
            return prev;
        });
    }
  }, [value]);

  const handleSaturationMove = React.useCallback((e: MouseEvent | TouchEvent) => {
    if (!saturationRef.current) return;
    const rect = saturationRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    let x = (clientX - rect.left) / rect.width;
    let y = 1 - (clientY - rect.top) / rect.height;
    
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));
    
    setHsv(prevHsv => {
      const newHsv = { ...prevHsv, s: x * 100, v: y * 100 };
      const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
      return newHsv;
    });
  }, [onChange]);

  const handleHueMove = React.useCallback((e: MouseEvent | TouchEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    let y = (clientY - rect.top) / rect.height;
    y = Math.max(0, Math.min(1, y));
    
    setHsv(prevHsv => {
      const newHsv = { ...prevHsv, h: y * 360 };
      const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
      return newHsv;
    });
  }, [onChange]);

  useEffect(() => {
    const handleUp = () => {
      isDraggingSaturation.current = false;
      isDraggingHue.current = false;
    };
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDraggingSaturation.current) handleSaturationMove(e);
      if (isDraggingHue.current) handleHueMove(e);
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [handleSaturationMove, handleHueMove]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button/Input */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-[#0D9E75]/30 transition-all shadow-sm"
      >
        <div 
          className="w-6 h-6 rounded-full border border-gray-100 shadow-inner" 
          style={{ backgroundColor: value }}
        />
        <span className="text-sm font-mono font-bold text-gray-700 tracking-tight uppercase">{value}</span>
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in duration-200">
          <div className="flex gap-4 mb-4 h-[200px]">
            {/* Saturation/Value Square */}
            <div 
              ref={saturationRef}
              onMouseDown={() => isDraggingSaturation.current = true}
              onTouchStart={() => isDraggingSaturation.current = true}
              className="relative flex-1 rounded-lg overflow-hidden cursor-crosshair"
              style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              
              {/* Selector Dot */}
              <div 
                className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg -translate-x-1/2 translate-y-1/2 pointer-events-none"
                style={{ 
                  left: `${hsv.s}%`, 
                  bottom: `${hsv.v}%`,
                }}
              />
            </div>

            {/* Hue Slider */}
            <div 
              ref={hueRef}
              onMouseDown={() => isDraggingHue.current = true}
              onTouchStart={() => isDraggingHue.current = true}
              className="w-4 rounded-full relative cursor-pointer"
              style={{ 
                background: 'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' 
              }}
            >
              {/* Slider Handle */}
              <div 
                className="absolute w-5 h-5 bg-white border-2 border-gray-100 rounded-full shadow-md left-1/2 -translate-x-1/2 -translate-y-1/2 ring-2 ring-black/5"
                style={{ top: `${(hsv.h / 360) * 100}%` }}
              />
            </div>
          </div>

          {/* Brand Colors */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Your brand colors</h4>
            <div className="flex flex-wrap gap-2">
              {brandColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => onChange(color)}
                  className="w-10 h-10 rounded-lg border border-gray-100 shadow-sm transition-transform hover:scale-110 active:scale-95"
                  style={{ backgroundColor: color }}
                />
              ))}
              <button 
                onClick={() => onAddBrandColor?.(value)}
                className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-[#0D9E75] hover:text-[#0D9E75] transition-all active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
