import React, { useState } from 'react';
import { ShopSettings, DaySchedule } from '../types';
import { Save, Clock, CalendarDays, Check, X, Upload, Smartphone } from 'lucide-react';

interface SettingsManagerProps {
  settings: ShopSettings;
  onSave: (settings: ShopSettings) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, onSave }) => {
  const [shopName, setShopName] = useState(settings.shopName);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp || '');
  const [schedule, setSchedule] = useState<DaySchedule[]>(settings.schedule || []);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(settings.logoUrl);
  
  const handleDayChange = (index: number, field: keyof DaySchedule, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
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
      whatsapp,
      schedule,
      logoUrl
    });
  };

  const formatPhone = (val: string) => {
    return val.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2').slice(0, 15);
  };

  return (
    <div className="mt-6 animate-fade-in">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">Configurações do Perfil</h3>

      <form onSubmit={handleSubmit} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-8">
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

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Seu WhatsApp (Receber Notificações)</label>
            <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                />
            </div>
            <p className="text-[10px] text-neutral-500 mt-1 italic">Número que receberá os agendamentos e entradas na fila.</p>
          </div>

          <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800">
             <label className="block text-sm font-medium text-neutral-400 mb-4">Logo da Barbearia (Importação Manual)</label>
             <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-4 w-full">
                    {logoUrl ? (
                      <div className="w-40 h-40 rounded-xl overflow-hidden border-2 border-neutral-800 shadow-xl relative group bg-neutral-900">
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => setLogoUrl(undefined)} className="p-2 bg-neutral-800 rounded-full text-white hover:bg-red-500 transition-colors border border-neutral-700">
                                <X size={18} />
                            </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-40 h-40 rounded-xl bg-neutral-900 border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center text-neutral-600 gap-2">
                        <Upload size={24} className="opacity-20" />
                        <span className="text-xs text-center px-1">Sem Logo</span>
                      </div>
                    )}
                    <div className="w-full max-w-[200px]">
                        <input type="file" id="logo-upload" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        <label htmlFor="logo-upload" className="w-full px-4 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-sm font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all">
                           <Upload size={16} /> Importar Logo
                        </label>
                    </div>
                </div>
             </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-4 flex items-center gap-2"><CalendarDays size={16} /> Horários de Funcionamento</label>
          <div className="space-y-3">
            {schedule.map((day, index) => (
              <div key={index} className={`p-3 rounded-lg border flex flex-col gap-3 transition-colors ${day.isOpen ? 'bg-neutral-950/50 border-neutral-800' : 'bg-neutral-950/30 border-neutral-800/50 opacity-70'}`}>
                 <div className="flex items-center gap-3 w-full">
                    <button type="button" onClick={() => handleDayChange(index, 'isOpen', !day.isOpen)} className={`w-10 h-6 rounded-full relative transition-colors ${day.isOpen ? 'bg-cyan-600' : 'bg-neutral-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${day.isOpen ? 'left-5' : 'left-1'}`}></div>
                    </button>
                    <span className={`font-medium ${day.isOpen ? 'text-white' : 'text-neutral-500'}`}>{day.dayName}</span>
                 </div>
                 {day.isOpen && (
                   <div className="flex items-center gap-2 w-full">
                      <input type="time" value={day.openTime} onChange={(e) => handleDayChange(index, 'openTime', e.target.value)} className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-2 text-sm text-white text-center" />
                      <span className="text-neutral-500 text-xs">até</span>
                      <input type="time" value={day.closeTime} onChange={(e) => handleDayChange(index, 'closeTime', e.target.value)} className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-2 text-sm text-white text-center" />
                   </div>
                 )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full py-3 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg flex items-center justify-center gap-2 transition-all">
          <Save size={18} /> Salvar Configurações
        </button>
      </form>
    </div>
  );
};