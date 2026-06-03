import React, { useState } from 'react';
import { ShopSettings, DaySchedule } from '../../types';
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

  const handleSave = () => {
    onSave({
      shopName,
      whatsapp,
      schedule,
      logoUrl
    });
  };

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <h3 className="text-lg font-bold text-white mb-4">Configurações Gerais</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Nome da Barbearia</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">WhatsApp de Avisos</label>
            <div className="relative">
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="(11) 99999-9999"
              />
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Logo da Barbearia</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden">
                {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Upload className="text-neutral-600" size={20} />}
              </div>
              <label className="px-3 py-2 text-xs bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-700 cursor-pointer hover:bg-neutral-700">
                Escolher arquivo
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <h3 className="text-lg font-bold text-white mb-4">Horários de Funcionamento</h3>

        <div className="space-y-3">
          {schedule.map((day, index) => (
            <div key={day.dayName} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-neutral-500" size={16} />
                  <span className="text-sm font-bold text-white">{day.dayName}</span>
                </div>
                <button
                  onClick={() => handleDayChange(index, 'isOpen', !day.isOpen)}
                  className={`px-2 py-1 text-[10px] rounded-full font-bold ${
                    day.isOpen ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                  }`}
                >
                  {day.isOpen ? 'Aberto' : 'Fechado'}
                </button>
              </div>

              {day.isOpen && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={(e) => handleDayChange(index, 'openTime', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-2 py-2 text-white text-xs outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => handleDayChange(index, 'closeTime', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-2 py-2 text-white text-xs outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
      >
        <Save size={16} /> Salvar Configurações
      </button>
    </div>
  );
};
