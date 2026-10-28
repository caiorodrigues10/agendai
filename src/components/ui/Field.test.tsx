import { render, screen } from '@testing-library/react';
import { Field } from './Field';

it('associates validation and help with the input without replacing its existing description', () => {
  render(
    <>
      <p id="existing-help">Obrigatório</p>
      <Field label="Nome" hint="Nome completo" error="Informe seu nome">
        <input aria-describedby="existing-help" />
      </Field>
    </>
  );
  const input = screen.getByRole('textbox', { name: /Nome/ });
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription('Obrigatório Nome completo Informe seu nome');
});
