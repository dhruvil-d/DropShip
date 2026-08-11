import React from 'react';
import { deriveDarkColor, type ColorRole } from '../../shared/colorTransform';
import { RefreshCcw } from 'lucide-react';

interface ColorPickerControlProps {
  label: string;
  role: ColorRole;
  lightColor: string;
  darkColorOverride?: string;
  onLightChange: (color: string) => void;
  onDarkChange: (color: string) => void;
  onDarkReset: () => void;
}

export const ColorPickerControl: React.FC<ColorPickerControlProps> = ({
  label,
  role,
  lightColor,
  darkColorOverride,
  onLightChange,
  onDarkChange,
  onDarkReset,
}) => {
  const isCustom = !!darkColorOverride;
  // If lightColor is empty or invalid, deriveDarkColor handles it gracefully
  const generatedDark = deriveDarkColor(lightColor, role);
  const activeDark = darkColorOverride || generatedDark;

  return (
    <div className="mt-3 flex flex-col gap-1.5 border border-gray-100 p-2 rounded bg-gray-50/50">
      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      
      <div className="flex items-start gap-3">
        {/* LIGHT MODE SIDE */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
            <span>☀ LIGHT</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={lightColor || '#000000'}
              onChange={(e) => onLightChange(e.target.value)}
              className="w-6 h-6 rounded border border-gray-200 cursor-pointer p-0"
            />
            <span className="text-xs text-gray-600 font-mono flex-1">{lightColor || 'none'}</span>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-[1px] bg-gray-200 self-stretch my-1" />

        {/* DARK MODE SIDE */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="text-[10px] text-gray-400 font-medium flex items-center justify-between">
            <span>☾ DARK</span>
            {isCustom ? (
              <span className="text-blue-500 font-semibold flex items-center gap-1">
                CUSTOM
                <button 
                  onClick={(e) => { e.preventDefault(); onDarkReset(); }}
                  className="text-gray-400 hover:text-red-500 ml-1 p-0.5 rounded transition-colors"
                  title="Reset to Auto"
                >
                  <RefreshCcw size={10} />
                </button>
              </span>
            ) : (
              <span className="text-gray-400">AUTO</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={activeDark || '#000000'}
              onChange={(e) => onDarkChange(e.target.value)}
              className="w-6 h-6 rounded border border-gray-200 cursor-pointer p-0"
            />
            <span className={`text-xs font-mono flex-1 ${isCustom ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              {activeDark || 'none'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
