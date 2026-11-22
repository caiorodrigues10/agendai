/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsManager } from './SettingsManager';
import type { ShopSettings } from '../../types';

/** O assistente real dispara importação em background; aqui só importa a seção. */
vi.mock('../dataImport', () => ({
  DataImportWizard: () => <div>Assistente de importação</div>,
}));

const settings: ShopSettings = {
  shopName: 'Barbearia Central',
  whatsapp: '',
  schedule: [],
};

const tab = (label: string) => screen.getByRole('tab', { name: label });

function renderSettings(query = '') {
  return render(
    <MemoryRouter initialEntries={[`/app/settings${query}`]}>
      <SettingsManager
        settings={settings}
        barbershopId="shop-1"
        onSave={vi.fn()}
        onNotify={vi.fn()}
      />
    </MemoryRouter>
  );
}

describe('SettingsManager — atalho ?section=', () => {
  it('?section=import abre a seção Importar dados', () => {
    renderSettings('?section=import');
    expect(tab('Importar dados')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Conta')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('heading', { name: 'Importar dados' })).toBeInTheDocument();
    expect(screen.getByText('Assistente de importação')).toBeInTheDocument();
  });

  it('sem ?section= continua começando em Conta', () => {
    renderSettings();
    expect(tab('Conta')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).not.toHaveTextContent('Assistente de importação');
  });

  it('mantém o rótulo acessível e as 10 abas de sempre', () => {
    renderSettings('?section=import');
    expect(screen.getByRole('tablist', { name: 'Seções de configurações' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(10);
  });
});
