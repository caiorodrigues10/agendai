import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StaffMember } from '../types';
import { Logo } from './Logo';
import { LoginSchema, LoginFormData } from '../schemas';
import { X, ArrowRight, ShieldCheck, LockKeyhole } from 'lucide-react';

interface StaffLoginProps {
  staffMembers: StaffMember[];
  onLogin: (member: StaffMember) => void;
  onClose: () => void;
  logoUrl?: string;
}

export const StaffLogin: React.FC<StaffLoginProps> = ({ staffMembers, onLogin, onClose, logoUrl }) => {
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema)
  });

  const onSubmit = (data: LoginFormData) => {
    const member = staffMembers.find(m => m.pin === data.pin);
    
    if (member) {
      onLogin(member);
      onClose();
    } else {
      setError('pin', { type: 'manual', message: 'PIN incorreto ou não encontrado' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 animate-fade-in backdrop-blur-md">
      
      <div className="w-full max-w-[380px] bg-neutral-900/80 border border-neutral-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
        
        <div className="h-1 w-full bg-gradient-to-r from-neutral-800 via-cyan-600 to-neutral-800 opacity-50"></div>

        <button 
            onClick={onClose} 
            className="absolute top-5 right-5 text-neutral-600 hover:text-white transition-colors p-2 hover:bg-neutral-800 rounded-full z-10"
        >
          <X size={18} />
        </button>

        <div className="p-10 flex flex-col items-center">
          
          <div className="mb-8 flex flex-col items-center gap-4">
            <Logo size="md" customImageUrl={logoUrl} />
            
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800">
               <LockKeyhole size={10} className="text-neutral-500" />
               <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                 Acesso Restrito
               </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
            
            <div className="space-y-4">
              <label className="block text-center text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em]">
                Digite seu PIN de Acesso
              </label>
              
              <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    className={`
                        w-full bg-black/50 border rounded-xl py-5 text-center text-2xl text-white 
                        outline-none transition-all placeholder-neutral-800 tracking-[0.8em] font-mono
                        focus:shadow-[0_0_20px_rgba(6,182,212,0.1)]
                        ${errors.pin 
                            ? 'border-red-900/50 text-red-400 focus:border-red-500' 
                            : 'border-neutral-800 focus:border-cyan-500/50 hover:border-neutral-700'}
                    `}
                    placeholder="••••"
                    autoFocus
                    {...register('pin')}
                  />
                  
                  {errors.pin && (
                    <div className="absolute -bottom-6 left-0 right-0 text-center animate-pulse">
                        <span className="text-[10px] font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                            {errors.pin.message}
                        </span>
                    </div>
                  )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-cyan-950 border border-cyan-800 text-cyan-400 hover:bg-cyan-900 hover:border-cyan-600 hover:text-white shadow-lg shadow-cyan-900/20 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300"
            >
              Entrar <ArrowRight size={14} />
            </button>
            
          </form>

          <div className="mt-10 flex flex-col items-center gap-2">
             <div className="flex items-center gap-1.5 opacity-30 text-neutral-500">
                <ShieldCheck size={10} />
                <span className="text-[9px] uppercase tracking-widest font-semibold">Sistema Seguro</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};