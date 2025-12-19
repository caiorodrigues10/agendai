import React, { useState } from 'react';
import { ShopSettings, DaySchedule } from '../types';
import { generateShopLogo } from '../services/geminiService';
import { Save, Clock, CalendarDays, Check, X, Sparkles, Loader2, RotateCw, Upload, Palette, Wand2, Download } from 'lucide-react';

interface SettingsManagerProps {
  settings: ShopSettings;
  onSave: (settings: ShopSettings) => void;
}

const COLOR_PALETTES = [
  { id: 'cyan', name: 'Cyber Neon', colors: 'Dark background (#000), Neon Cyan (#06b6d4), White', bg: 'bg-cyan-500' },
  { id: 'gold', name: 'Luxo Gold', colors: 'Black background, Gold (#FFD700), White', bg: 'bg-yellow-500' },
  { id: 'bw', name: 'Monocromático', colors: 'Black, White, Dark Grey', bg: 'bg-white' },
  { id: 'vintage', name: 'Vintage Barber', colors: 'Navy Blue, Red, Cream White', bg: 'bg-red-500' },
  { id: 'green', name: 'Eco Fresh', colors: 'Dark Green, Light Green, White', bg: 'bg-green-500' },
];

export const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, onSave }) => {
  const [shopName, setShopName] = useState(settings.shopName);
  const [schedule, setSchedule] = useState<DaySchedule[]>(settings.schedule || []);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(settings.logoUrl);
  
  // AI Logo State
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleDayChange = (index: number, field: keyof DaySchedule, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const handleGenerateLogo = async () => {
    setIsGeneratingLogo(true);
    const newLogo = await generateShopLogo(shopName, selectedPalette.colors, customPrompt);
    if (newLogo) {
      setLogoUrl(newLogo);
    }
    setIsGeneratingLogo(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      shopName,
      schedule,
      logoUrl
    });
  };

  // Helper to calculate bar width and position
  const getTimeBarStyles = (open: string, close: string) => {
    const timeToMinutes = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };
    
    const start = timeToMinutes(open);
    const end = timeToMinutes(close);
    const totalDay = 1440; // 24 * 60

    const left = (start / totalDay) * 100;
    let width = ((end - start) / totalDay) * 100;
    
    if (width < 0) width = 0; // Prevent negative width

    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <div className="mt-6 animate-fade-in">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        Configurações da Loja
      </h3>

      <form onSubmit={handleSubmit} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-8">
        
        {/* Shop Name & Logo Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Nome da Barbearia</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800">
             <label className="block text-sm font-medium text-neutral-400 mb-4">Logo da Barbearia</label>
             
             <div className="flex flex-col md:flex-row gap-6">
                {/* Preview Area */}
                <div className="flex flex-col items-center gap-2">
                    {logoUrl ? (
                      <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-neutral-800 shadow-xl relative group bg-neutral-900">
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        
                        {/* Actions Overlay */}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a 
                                href={logoUrl} 
                                download={`logo-${shopName.replace(/\s+/g, '-').toLowerCase() || 'barbearia'}.png`}
                                className="p-2 bg-neutral-800 rounded-full text-white hover:bg-cyan-600 transition-colors border border-neutral-700"
                                title="Baixar Logo"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Download size={18} />
                            </a>
                            <button 
                                type="button"
                                onClick={() => setLogoUrl(undefined)}
                                className="p-2 bg-neutral-800 rounded-full text-white hover:bg-red-500 transition-colors border border-neutral-700"
                                title="Remover Logo"
                            >
                                <X size={18} />
                            </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-xl bg-neutral-900 border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center text-neutral-600 gap-2">
                        <span className="text-xs text-center px-1">Sem Logo</span>
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <div className="w-full">
                        <input 
                           type="file" 
                           id="logo-upload" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={handleFileUpload}
                        />
                        <label 
                           htmlFor="logo-upload" 
                           className="w-full px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-xs font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                           <Upload size={14} /> Importar
                        </label>
                    </div>
                </div>

                {/* AI Generator Controls */}
                <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-1">
                            <Palette size={12} /> Paleta de Cores (IA)
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {COLOR_PALETTES.map(palette => (
                                <button
                                    key={palette.id}
                                    type="button"
                                    onClick={() => setSelectedPalette(palette)}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-2
                                        ${selectedPalette.id === palette.id 
                                            ? 'bg-neutral-800 border-cyan-500 text-white' 
                                            : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700'}
                                    `}
                                >
                                    <div className={`w-2 h-2 rounded-full ${palette.bg}`}></div>
                                    {palette.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-1">
                            <Wand2 size={12} /> Instruções Extras
                        </label>
                        <textarea 
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Ex: Quero um desenho de uma caveira com tesoura, estilo minimalista..."
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-700 focus:border-cyan-500 outline-none resize-none h-20"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerateLogo}
                        disabled={isGeneratingLogo || !shopName}
                        className="w-full px-4 py-3 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-800/50 hover:border-cyan-500 text-cyan-400 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/10"
                    >
                        {isGeneratingLogo ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Criando sua arte...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} /> Gerar Logo com IA
                            </>
                        )}
                    </button>
                </div>
             </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-4 flex items-center gap-2">
             <CalendarDays size={16} /> Horários de Funcionamento
          </label>
          
          <div className="space-y-3">
            {schedule.map((day, index) => (
              <div key={index} className={`p-3 rounded-lg border flex flex-col gap-3 transition-colors ${day.isOpen ? 'bg-neutral-950/50 border-neutral-800' : 'bg-neutral-950/30 border-neutral-800/50 opacity-70'}`}>
                 <div className="flex items-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => handleDayChange(index, 'isOpen', !day.isOpen)}
                      className={`w-10 h-6 rounded-full relative transition-colors ${day.isOpen ? 'bg-cyan-600' : 'bg-neutral-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${day.isOpen ? 'left-5' : 'left-1'}`}></div>
                    </button>
                    <span className={`font-medium ${day.isOpen ? 'text-white' : 'text-neutral-500'}`}>{day.dayName}</span>
                 </div>

                 {day.isOpen ? (
                   <>
                       <div className="flex items-center gap-2 w-full">
                          <div className="flex-1">
                            <input
                              type="time"
                              value={day.openTime}
                              onChange={(e) => handleDayChange(index, 'openTime', e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-2 text-sm text-white focus:border-cyan-500 outline-none text-center"
                            />
                          </div>
                          <span className="text-neutral-500 text-xs">até</span>
                          <div className="flex-1">
                            <input
                              type="time"
                              value={day.closeTime}
                              onChange={(e) => handleDayChange(index, 'closeTime', e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-2 text-sm text-white focus:border-cyan-500 outline-none text-center"
                            />
                          </div>
                       </div>
                       
                       {/* Visual Time Bar */}
                       <div className="w-full px-1 pt-1 pb-2">
                            <div className="h-2 bg-neutral-900 rounded-full relative w-full overflow-hidden border border-neutral-800/50">
                                {/* Markers */}
                                <div className="absolute top-0 bottom-0 left-[25%] w-[1px] bg-neutral-800"></div> {/* 06h */}
                                <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-neutral-800"></div> {/* 12h */}
                                <div className="absolute top-0 bottom-0 left-[75%] w-[1px] bg-neutral-800"></div> {/* 18h */}

                                {/* Active Bar */}
                                <div 
                                    className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full opacity-80"
                                    style={getTimeBarStyles(day.openTime, day.closeTime)}
                                ></div>
                            </div>
                            <div className="flex justify-between text-[8px] text-neutral-600 font-mono mt-1 px-0.5">
                                <span>00h</span>
                                <span>06h</span>
                                <span>12h</span>
                                <span>18h</span>
                                <span>24h</span>
                            </div>
                       </div>
                   </>
                 ) : (
                    <div className="w-full text-center py-1.5 text-sm text-neutral-600 font-medium bg-neutral-900/50 rounded border border-dashed border-neutral-800">
                       Fechado
                    </div>
                 )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800">
           <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Save size={18} /> Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
};