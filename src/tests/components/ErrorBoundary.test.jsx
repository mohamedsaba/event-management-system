import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from '@/components/ErrorBoundary';

// A mock component designed to crash
const Bomb = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('Simulated Crash');
  return <div>Safe Component</div>;
};

describe('ErrorBoundary Component', () => {
  it('renders children normally when there is no error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe Component')).toBeInTheDocument();
  });

  it('catches errors and displays the fallback UI', () => {
    // We spy on console.error and suppress it so our test terminal stays clean
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    // It should display the fallback UI and the error message
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Simulated Crash')).toBeInTheDocument();

    spy.mockRestore();
  });
});