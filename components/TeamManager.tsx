import React, { useState } from 'react';
import { StaffMember } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, UserPlus, Shield, User, X, Check } from 'lucide-react';

interface TeamManagerProps {
  staff: StaffMember[];
  onUpdateTeam: (newTeam: StaffMember[]) => void;
  currentAdminId: string;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ staff, onUpdateTeam, currentAdminId }) => {
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newName || !newPin) return;

    const newMember: StaffMember = {
        id: uuidv4(),
        name: newName,
        pin: newPin,
        role: 'barber' // Default to barber, only the main account is admin usually
    };

    onUpdateTeam([...staff, newMember]);
    setNewName('');
    setNewPin('');
    setIsAdding(false);
  };

  const confirmDelete = (id: string) => {
      onUpdateTeam(staff.filter(m => m.id !== id));
      setDeleteConfirmId(null);
  };

  return (
    <div className="mt-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Equipe & Acessos</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 rounded-lg text-xs font-bold hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-1"
        >
          <UserPlus size={14} /> Adicionar
        </button>
      </div>

      {isAdding && (
          <form onSubmit={handleAddMember} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 mb-4 animate-fade-in-down">
              <h4 className="text-sm font-bold text-white mb-3">Novo Membro</h4>
              <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Nome (ex: Carlos)" 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white text-sm focus:ring-1 focus:ring-cyan-500 outline-none"
                    required
                  />
                  <input 
                    type="tel" 
                    placeholder="PIN de Acesso (4-6 dígitos)" 
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g,'').slice(0,6))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white text-sm focus:ring-1 focus:ring-cyan-500 outline-none"
                    required
                  />
                  <div className="flex gap-2">
                      <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 text-xs text-neutral-400 bg-neutral-800 rounded hover:bg-neutral-700">Cancelar</button>
                      <button type="submit" className="flex-1 py-2 text-xs text-white font-bold bg-cyan-600 rounded hover:bg-cyan-500">Cadastrar</button>
                  </div>
              </div>
          </form>
      )}

      <div className="space-y-2">
        {staff.map((member) => (
          <div key={member.id} className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${member.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-800 text-neutral-400'}`}>
                {member.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
              </div>
              <div>
                <h4 className="font-medium text-sm text-neutral-200">{member.name} {member.id === currentAdminId && '(Você)'}</h4>
                <p className="text-xs text-neutral-500 flex items-center gap-1">
                   PIN: •••• <span className="uppercase text-[0.6rem] border border-neutral-800 px-1 rounded bg-neutral-950">{member.role === 'admin' ? 'Gerente' : 'Barbeiro'}</span>
                </p>
              </div>
            </div>
            
            {member.role !== 'admin' && (
                <div>
                   {deleteConfirmId === member.id ? (
                        <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-lg border border-red-900/50">
                            <span className="text-[10px] text-red-400 pl-2 font-bold">Excluir?</span>
                            <button 
                                onClick={() => confirmDelete(member.id)}
                                className="p-1 bg-red-600 text-white rounded hover:bg-red-500"
                            >
                                <Check size={14} />
                            </button>
                            <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-1 bg-neutral-800 text-neutral-400 rounded hover:bg-neutral-700"
                                title="Cancelar"
                            >
                                <X size={14} />
                            </button>
                        </div>
                   ) : (
                        <button
                            onClick={() => setDeleteConfirmId(member.id)}
                            className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                   )}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};