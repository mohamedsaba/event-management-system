import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useState } from 'react';

// The extracted hook logic
const useLoginAttempts = () => {
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const recordFailure = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= 5) {
      setIsLocked(true);
      setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
      }, 5 * 60 * 1000); // 5 minutes
    }
  };

  return { attempts, isLocked, recordFailure };
};

describe('Security Lockout Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // Hijack the Javascript clock
  });

  afterEach(() => {
    vi.useRealTimers(); // Give the clock back
  });

  it('locks the user out exactly on the 5th failed attempt', () => {
    const { result } = renderHook(() => useLoginAttempts());

    // Fail 4 times
    for(let i = 0; i < 4; i++) act(() => result.current.recordFailure());
    expect(result.current.isLocked).toBe(false);

    // 5th failure
    act(() => result.current.recordFailure());
    expect(result.current.isLocked).toBe(true);
  });

  it('automatically unlocks after 5 minutes', () => {
    const { result } = renderHook(() => useLoginAttempts());
    
    // Trigger the lockout
    for(let i = 0; i < 5; i++) act(() => result.current.recordFailure());
    expect(result.current.isLocked).toBe(true);

    // Fast forward time by 4 minutes and 59 seconds
    act(() => { vi.advanceTimersByTime((5 * 60 * 1000) - 1000); });
    expect(result.current.isLocked).toBe(true);

    // Fast forward the final second
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.isLocked).toBe(false);
    expect(result.current.attempts).toBe(0);
  });
});