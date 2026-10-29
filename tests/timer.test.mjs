import test from 'node:test';
import assert from 'node:assert/strict';

// Core timer calculation logic
function calculateRemaining(targetEndAt, now = Date.now()) {
  const diffMs = targetEndAt - now;
  return Math.max(0, Math.ceil(diffMs / 1000));
}

function reconcileActiveTimer(state, now = Date.now()) {
  if (!state || state.status !== 'running' || !state.targetEndAt) {
    return state;
  }
  const remaining = calculateRemaining(state.targetEndAt, now);
  return {
    ...state,
    remainingSeconds: remaining,
    status: remaining <= 0 ? 'completed' : 'running',
    lastUpdated: now,
  };
}

test('calculateRemaining: accurately calculates seconds remaining before target', () => {
  const now = 1000000;
  const targetEndAt = now + 25 * 60 * 1000; // 25 minutes in future
  const secondsLeft = calculateRemaining(targetEndAt, now);
  assert.equal(secondsLeft, 1500); // 1500 seconds
});

test('calculateRemaining: clamps to 0 if target is in the past', () => {
  const now = 2000000;
  const targetEndAt = now - 5000; // 5 seconds in past
  const secondsLeft = calculateRemaining(targetEndAt, now);
  assert.equal(secondsLeft, 0);
});

test('reconcileActiveTimer: maintains running status when time remains', () => {
  const now = 1000000;
  const targetEndAt = now + 120 * 1000; // 2 minutes left
  const state = {
    status: 'running',
    phase: 'focus',
    targetEndAt,
    remainingSeconds: 120,
    totalDurationSeconds: 1500,
  };
  const reconciled = reconcileActiveTimer(state, now + 30 * 1000); // 30s later
  assert.equal(reconciled.status, 'running');
  assert.equal(reconciled.remainingSeconds, 90);
});

test('reconcileActiveTimer: automatically transitions to completed if device slept past end', () => {
  const now = 1000000;
  const targetEndAt = now + 60 * 1000; // 1 min duration
  const state = {
    status: 'running',
    phase: 'focus',
    targetEndAt,
    remainingSeconds: 60,
    totalDurationSeconds: 60,
  };
  const reconciled = reconcileActiveTimer(state, now + 75 * 1000); // 75s later (slept past target)
  assert.equal(reconciled.status, 'completed');
  assert.equal(reconciled.remainingSeconds, 0);
});
