import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TabGuard } from './TabGuard';

const state = vi.hoisted(() => ({
  role: 'OWNER',
  permissions: [] as string[],
  hasDashboard: true,
  loading: false,
}));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: state.role, permissions: state.permissions } }),
}));
vi.mock('../../contexts/SubscriptionContext', () => ({
  useSubscription: () => ({ hasDashboard: state.hasDashboard, loading: state.loading, data: null }),
}));
vi.mock('../../pages/AccessDeniedPage', () => ({ AccessDeniedPage: () => <p>Acesso negado</p> }));

function view() {
  render(
    <MemoryRouter initialEntries={['/app/products']}>
      <Routes>
        <Route
          path="/app/:tab"
          element={
            <TabGuard>
              <p>Catálogo protegido</p>
            </TabGuard>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}
beforeEach(() =>
  Object.assign(state, { role: 'OWNER', permissions: [], hasDashboard: true, loading: false })
);
it('allows an entitled owner to enter Products', () => {
  view();
  expect(screen.getByText('Catálogo protegido')).toBeVisible();
});
it('denies Products without dashboard access', () => {
  state.hasDashboard = false;
  view();
  expect(screen.queryByText('Catálogo protegido')).not.toBeInTheDocument();
});
it('requires both employee permission and entitlement', () => {
  state.role = 'EMPLOYEE';
  state.permissions = ['RETAIL_SELL'];
  view();
  expect(screen.getByText('Catálogo protegido')).toBeVisible();
});
it('does not mount protected contents before the initial entitlement resolves', () => {
  state.loading = true;
  view();
  expect(screen.getByRole('status')).toBeVisible();
  expect(screen.queryByText('Catálogo protegido')).not.toBeInTheDocument();
});
