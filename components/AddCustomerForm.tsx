import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { ServiceCard } from './ServiceCard';
import { X, Loader2, UserCheck } from 'lucide-react';

interface AddCustomerFormProps {
  services: Service[];
  onJoin: (name: string, whatsapp: string, serviceId: string, isManualEntry?: boolean) => void;
  onCancel: () => void;
  isStaffMode?: boolean; // New prop to indicate staff is adding
}

export const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ services, onJoin, onCancel, isStaffMode = false }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (services.length > 0) {
      setSelectedServiceId(services[0].id);
    }
  }, [services]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedServiceId) return;
    
    // For regular users, whatsapp is required. For staff, it's optional (walk-in).
    if (!isStaffMode && !whatsapp.trim()) return;

    setLoading(true);
    setTimeout(() => {
        onJoin(name, whatsapp || '00000000000', selectedServiceId, isStaffMode);
        setLoading(false);
    }, 600);
  };

  const formatPhone = (val: string) => {
    return val.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2').slice(0, 15);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className={`bg-neutral-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border ${isStaffMode ? 'border-cyan-800' : 'border-neutral-800'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
             {isStaffMode && <UserCheck className="text-cyan-400" size={24} />}
             <h2 className="text-2xl font-bold text-white">
                {isStaffMode ? 'Adicionar Cliente Manual' : 'Entrar na Fila'}
             </h2>
          </div>
          <button onClick={onCancel} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Nome do Cliente</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-neutral-700"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
                WhatsApp {isStaffMode ? '(Opcional)' : '(para aviso)'}
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
              placeholder="(11) 99999-9999"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-neutral-700"
              required={!isStaffMode}
            />
             {!isStaffMode && <p className="text-xs text-neutral-500 mt-1">
              *O dono será notificado e te avisaremos quando faltar 15min.
            </p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Serviço</label>
            {services.length === 0 ? (
                <div className="text-center p-4 bg-neutral-950 rounded-xl text-neutral-500">
                    Nenhum serviço disponível no momento.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                {services.map((service) => (
                    <ServiceCard
                    key={service.id}
                    service={service}
                    selected={selectedServiceId === service.id}
                    onSelect={() => setSelectedServiceId(service.id)}
                    />
                ))}
                </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!name.trim() || (!isStaffMode && !whatsapp.trim()) || !selectedServiceId || loading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                !name.trim() || (!isStaffMode && !whatsapp.trim()) || !selectedServiceId || loading
                  ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  : 'bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-cyan-500/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processando...
                </>
              ) : (
                isStaffMode ? 'Adicionar à Fila' : 'Confirmar e Avisar Dono'
              )}
            </button>
            {!isStaffMode && <p className="text-center text-xs text-neutral-500 mt-4">
              Ao entrar, você será redirecionado para o WhatsApp do barbeiro.
            </p>}
          </div>
        </form>
      </div>
    </div>
  );
};