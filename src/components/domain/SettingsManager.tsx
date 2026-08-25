import React, { useState } from 'react';
import { ShopSettings, DaySchedule } from '../../types';
import { barbershopApi } from '../../infra/barbershopApi';
import { maskPhone } from '../../utils/documentUtils';
import { getErrorMessage } from '../../utils/errorMessage';
import { Save, Clock, CalendarDays, Check, X, Upload, Smartphone, Loader2 } from 'lucide-react';

interface SettingsManagerProps {
  settings: ShopSettings;
  barbershopId?: string;
  onSave: (settings: ShopSettings) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  barbershopId,
  onSave,
}) => {
  const [shopName, setShopName] = useState(settings.shopName);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp || '');
  const [schedule, setSchedule] = useState<DaySchedule[]>(settings.schedule || []);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(settings.logoUrl);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const handleDayChange = (index: number, field: keyof DaySchedule, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !barbershopId) return;

    setLogoUploading(true);
    setLogoError(null);
    try {
      const { uploadUrl, publicUrl } = await barbershopApi.getLogoUploadUrl(
        barbershopId,
        file.type
      );
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!putRes.ok) {
        throw new Error(
          `Falha ao enviar a imagem para o storage (${putRes.status}). Verifique CORS do bucket e as credenciais GCS.`
        );
      }
      await barbershopApi.confirmLogo(barbershopId, publicUrl);
      setLogoUrl(publicUrl);
    } catch (err) {
      setLogoUrl(settings.logoUrl);
      setLogoError(getErrorMessage(err, 'Não foi possível enviar a logo. Tente novamente.'));
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = () => {
    onSave({
      shopName,
      whatsapp,
      schedule,
      logoUrl,
    });
  };

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-4">Configurações Gerais</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Nome do Salão</label>
            <input
              type="text"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">WhatsApp de Avisos</label>
            <div className="relative">
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(maskPhone(e.target.value))}
                className="w-full bg-bg border border-border rounded-lg pl-10 pr-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-accent"
                placeholder="(11) 99999-9999"
              />
              <Smartphone
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={16}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Logo do Salão</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-bg border border-border flex items-center justify-center overflow-hidden">
                {logoUploading ? (
                  <Loader2 className="text-accent animate-spin" size={20} />
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="text-text-muted" size={20} />
                )}
              </div>
              <label
                className={`px-3 py-2 text-xs bg-surface-2 text-text-secondary rounded-lg border border-border-strong cursor-pointer hover:bg-border-strong ${logoUploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {logoUploading ? 'Enviando...' : 'Escolher arquivo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={logoUploading}
                />
              </label>
            </div>
            {logoError && (
              <p className="mt-2 text-xs text-danger" role="alert">
                {logoError}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-4">Horários de Funcionamento</h3>

        <div className="space-y-3">
          {schedule.map((day, index) => (
            <div key={day.dayName} className="bg-bg border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-text-muted" size={16} />
                  <span className="text-sm font-bold text-text-primary">{day.dayName}</span>
                </div>
                <button
                  onClick={() => handleDayChange(index, 'isOpen', !day.isOpen)}
                  className={`px-2 py-1 text-[10px] rounded-full font-bold ${
                    day.isOpen ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  }`}
                >
                  {day.isOpen ? 'Aberto' : 'Fechado'}
                </button>
              </div>

              {day.isOpen && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Clock
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
                      size={14}
                    />
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={e => handleDayChange(index, 'openTime', e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg pl-8 pr-2 py-2 text-text-primary text-xs outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Clock
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
                      size={14}
                    />
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={e => handleDayChange(index, 'closeTime', e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg pl-8 pr-2 py-2 text-text-primary text-xs outline-none"
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
        className="w-full py-3 bg-accent hover:bg-accent-hover text-accent-fg font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
      >
        <Save size={16} /> Salvar Configurações
      </button>
    </div>
  );
};
