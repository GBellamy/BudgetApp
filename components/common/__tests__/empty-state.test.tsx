import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { EmptyState } from '../empty-state';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="Aucune transaction" />);
    expect(screen.getByText('Aucune transaction')).toBeTruthy();
  });

  it('should render subtitle when provided', () => {
    render(<EmptyState title="Aucune transaction" subtitle="Ajoutez-en une !" />);
    expect(screen.getByText('Ajoutez-en une !')).toBeTruthy();
  });

  it('should render custom icon', () => {
    render(<EmptyState icon="🔍" title="Pas de résultats" />);
    expect(screen.getByText('🔍')).toBeTruthy();
  });

  it('should render default icon when not specified', () => {
    render(<EmptyState title="Vide" />);
    expect(screen.getByText('📭')).toBeTruthy();
  });
});
