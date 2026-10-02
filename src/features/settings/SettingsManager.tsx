
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopSettings, DaySchedule } from '../../types';
import { barbershopApi } from '../../infra/barbershopApi';
import { maskPhone, normalizePhoneBR } from '../../utils/documentUtils';
import { getErrorMessage } from '../../utils/errorMessage';
import { AccountPrivacyPanel } from './AccountPrivacyPanel';
import { SupportPanel } from '../support/SupportPanel';
import { OwnerNotificationsPanel } from '../notifications';
import { QueueAlertSettings } from './QueueAlertSettings';
import { ShopCityField } from './ShopCityField';
import { WeatherForecastCard } from './WeatherForecastCard';
import { AppointmentPolicySection } from './AppointmentPolicySection';
import { SalonWhatsAppConnection } from './SalonWhatsAppConnection';
import { BusinessSegmentSection } from './BusinessSegmentSection';
import { OperationModeSection } from './OperationModeSection';
import { ShopFloorControls } from '../../features/shop';
import { Field, FIELD_CONTROL } from '../../components/ui/Field';
import { EmailPreferencesPanel } from './EmailPreferencesPanel';
import { EmailHistoryPanel } from './EmailHistoryPanel';
import {
  LuSave as Save,
  LuClock as Clock,
  LuCalendarDays as CalendarDays,
  LuUpload as Upload,
  LuSmartphone as Smartphone,
  LuLoaderCircle as Loader2,
  LuWallet as Wallet,
  LuUserRound as UserRound,
  LuStore as Store,
  LuShieldCheck as ShieldCheck,
  LuMail as Mail,
  LuCircleHelp as CircleHelp,
} from 'react-icons/lu';

type SettingsSection = 'account' | 'shop' | 'whatsapp' | 'operation' | 'email' | 'privacy' | 'help';

const SETTINGS_SECTIONS: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: 'account', label: 'Conta', icon: UserRound },
  { id: 'shop', label: 'Estabelecimento', icon: Store },
  { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
  { id: 'operation', label: 'Funcionamento', icon: Clock },
  { id: 'email', label: 'E-mail e notificações', icon: Mail },
  { id: 'privacy', label: 'Privacidade', icon: ShieldCheck },
  { id: 'help', label: 'Ajuda e suporte', icon: CircleHelp },
];

interface SettingsManagerProps {
  settings: ShopSettings;
  barbershopId?: string;
  onSave: (settings: ShopSettings) => void | Promise<void>;
  onNotify: (message: string, type: 'success' | 'error') => void;
  showNotifications?: boolean;
  accountSection?: React.ReactNode;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  barbershopId,
  onSave,
  onNotify,
  showNotifications = false,
  accountSection,
}) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [shopName, setShopName] = useState(settings.shopName);
  const [whatsapp, setWhatsapp] = useState(() => maskPhone(settings.whatsapp || ''));
  const [schedule, setSchedule] = useState<DaySchedule[]>(settings.schedule || []);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(settings.logoUrl);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [address, setAddress] = useState(settings.address || '');
  const [city, setCity] = useState(settings.city || '');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(settings.googleReviewUrl || '');
  const [saving, setSaving] = useState(false);

  const handleDayChange = (index: number, field: keyof DaySchedule, value: string | boolean) => {
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
      const { logoUrl: newLogoUrl } = await barbershopApi.uploadLogoDirect(barbershopId, file);
      setLogoUrl(newLogoUrl);
    } catch (err) {
      setLogoUrl(settings.logoUrl);
      setLogoError(getErrorMessage(err, 'Não foi possível enviar a logo. Tente novamente.'));
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    for (const day of schedule) {
      if (day.isOpen && day.openTime >= day.closeTime) {
        onNotify(
          `${day.dayName}: horário de abertura deve ser anterior ao de fechamento.`,
          'error'
        );
        return;
      }
    }
    setSaving(true);
    try {
      await onSave({
        ...settings,
        shopName,
        whatsapp: normalizePhoneBR(whatsapp),
        address,
        city,
        schedule,
        logoUrl,
        googleReviewUrl: googleReviewUrl.trim() || null,
      });
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível salvar as configurações.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveButton = (
    <button
      type="button"
      onClick={() => void handleSave()}
      disabled={saving}
      className="w-full py-3 bg-accent hover:bg-accent-hover text-accent-fg font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50"
    >
      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      {saving ? 'Salvando...' : 'Salvar Configurações'}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <nav
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
        aria-label="Seções de configurações"
      >
        {SETTINGS_SECTIONS.map(section => {
          const Icon = section.icon;
          const active = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold border transition-colors ${
                active
                  ? 'bg-accent text-accent-fg border-accent'
                  : 'bg-surface text-text-secondary border-border hover:border-border-strong'
              }`}
            >
              <Icon size={14} />
              {section.label}
            </button>
          );
        })}
      </nav>

      {activeSection === 'account' && (
        <div className="space-y-6">
          {accountSection}
          <button
            type="button"
            onClick={() => navigate('/app/subscription')}
            className="w-full py-3 bg-accent/15 hover:bg-accent/25 text-accent font-bold rounded-xl flex items-center justify-center gap-2 border border-accent/40"
          >
            <Wallet size={16} /> Pagar ou gerenciar plano
          </button>
        </div>
      )}

      {activeSection === 'shop' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-lg font-bold text-text-primary mb-1">Dados do estabelecimento</h3>
            <p className="text-xs text-text-muted mb-4">
              Nome, endereço, cidade e logo visíveis para os clientes.
            </p>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="shrink-0">
                  <span className="block text-sm text-text-secondary mb-1.5">Logo do Salão</span>
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
                <div className="flex-1 min-w-0 w-full">
                  <Field label="Nome do Salão">
                    <input
                      type="text"
                      value={shopName}
                      onChange={e => setShopName(e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </Field>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Field label="Endereço">
                    <input
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className={FIELD_CONTROL}
                      placeholder="Rua, número e bairro"
                    />
                  </Field>
                </div>
                <div>
                  <ShopCityField
                    city={city}
                    onCityChange={setCity}
                    settings={settings}
                  />
                </div>
              </div>
              <Field label="Link de avaliação do Google">
                <input
                  type="url"
                  value={googleReviewUrl}
                  onChange={e => setGoogleReviewUrl(e.target.value)}
                  className={FIELD_CONTROL}
                  placeholder="https://g.page/r/..."
                />
              </Field>
            </div>
          </div>

          <WeatherForecastCard barbershopId={barbershopId} settings={settings} />

          <BusinessSegmentSection settings={settings} onNotify={onNotify} onSave={onSave} />
          {saveButton}
        </div>
      )}

      {activeSection === 'whatsapp' && (
        <div className="space-y-6">
          {barbershopId ? (
            <SalonWhatsAppConnection
              barbershopId={barbershopId}
              whatsapp={whatsapp}
              onWhatsappChange={setWhatsapp}
            />
          ) : (
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-lg font-bold text-text-primary mb-1">WhatsApp</h3>
              <p className="text-sm text-text-secondary">
                Conecte um estabelecimento para configurar o WhatsApp.
              </p>
            </div>
          )}
          {showNotifications && barbershopId && <OwnerNotificationsPanel onNotify={onNotify} />}
          {showNotifications && barbershopId && (
            <QueueAlertSettings barbershopId={barbershopId} onNotify={onNotify} />
          )}
          {saveButton}
        </div>
      )}

      {activeSection === 'operation' && (
        <div className="space-y-6">
          <OperationModeSection settings={settings} barbershopId={barbershopId} onNotify={onNotify} />
          {barbershopId && <ShopFloorControls variant="full" onNotify={onNotify} />}

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
                      type="button"
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

          {barbershopId && <AppointmentPolicySection barbershopId={barbershopId} onNotify={onNotify} />}
          {saveButton}
        </div>
      )}

      {activeSection === 'privacy' && <AccountPrivacyPanel onNotify={onNotify} />}

      {activeSection === 'help' && <SupportPanel />}

      {activeSection === 'email' && barbershopId && (
        <div className="space-y-4">
          <EmailPreferencesPanel barbershopId={barbershopId} onNotify={onNotify} />
          <EmailHistoryPanel barbershopId={barbershopId} />
        </div>
      )}
    </div>
  );
};

