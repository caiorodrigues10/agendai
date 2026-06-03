import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { LoginSchema, LoginFormData } from '../schemas';
import { useAuth } from '../contexts/AuthContext';
import { authStorage } from '../infra/authStorage';
import { Logo } from '../components/ui/Logo';
import { ArrowRight, LockKeyhole, AlertCircle, Mail, Key, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    const ok = await login(data.email, data.password);
    if (!ok) {
      setError('root', { type: 'manual', message: 'E-mail ou senha inválidos' });
      return;
    }
    const loggedUser = authStorage.getUser();
    if (loggedUser) {
      const role = loggedUser.role.toUpperCase();
      if (role === 'MASTER_ADMIN' || role === 'ADMIN') {
        navigate('/master/dashboard');
        return;
      }
    }
    navigate('/app/queue');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-neutral-900/80 border border-neutral-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
        <div className="h-1 w-full bg-linear-to-r from-neutral-800 via-cyan-600 to-neutral-800 opacity-50"></div>
        <div className="p-10 flex flex-col items-center">
          <div className="mb-8 flex flex-col items-center gap-4">
            <Logo size="md" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800">
               <LockKeyhole size={10} className="text-neutral-500" />
               <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                 Acesso Restrito
               </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
            <div className="space-y-4">

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">E-mail</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-neutral-500 group-focus-within:text-cyan-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      className={`
                          w-full bg-black/50 border rounded-xl py-3 pl-10 pr-4 text-white text-sm
                          outline-none transition-all placeholder-neutral-700
                          focus:shadow-[0_0_15px_rgba(6,182,212,0.1)]
                          ${errors.email
                              ? 'border-red-900/50 text-red-400 focus:border-red-500'
                              : 'border-neutral-800 focus:border-cyan-500/50 hover:border-neutral-700'}
                      `}
                      placeholder="seu@email.com"
                      autoFocus
                      {...register('email')}
                    />
                </div>
                {errors.email && (
                    <span className="text-[10px] font-medium text-red-500 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.email.message}
                    </span>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">Senha</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key size={16} className="text-neutral-500 group-focus-within:text-cyan-500 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`
                          w-full bg-black/50 border rounded-xl py-3 pl-10 pr-10 text-white text-sm
                          outline-none transition-all placeholder-neutral-700
                          focus:shadow-[0_0_15px_rgba(6,182,212,0.1)]
                          ${errors.password
                              ? 'border-red-900/50 text-red-400 focus:border-red-500'
                              : 'border-neutral-800 focus:border-cyan-500/50 hover:border-neutral-700'}
                      `}
                      placeholder="••••••••"
                      {...register('password')}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-neutral-500 hover:text-cyan-400 transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                </div>
                {errors.password && (
                    <span className="text-[10px] font-medium text-red-500 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.password.message}
                    </span>
                )}
              </div>
            </div>

            {errors.root && (
               <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center justify-center gap-2 text-red-400 text-xs font-medium">
                  <AlertCircle size={14} /> {errors.root.message}
               </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-cyan-950 border border-cyan-800 text-cyan-400 hover:bg-cyan-900 hover:border-cyan-600 hover:text-white shadow-lg shadow-cyan-900/20 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 mt-2"
            >
              Entrar <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
