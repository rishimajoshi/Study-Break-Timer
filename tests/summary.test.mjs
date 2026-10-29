import test from 'node:test';
import assert from 'node:assert/strict';

function calculateProgressSummary(sessions, mockNow = new Date('2026-10-29T12:00:00Z')) {
  // 1. Only completed focus sessions count toward study totals
  const completedFocus = sessions.filter(
    (s) => s.status === 'completed' && s.session_type === 'focus'
  );

  const totalCompletedSessions = completedFocus.length;
  const totalCompletedSeconds = completedFocus.reduce(
    (acc, s) => acc + (s.actual_duration_seconds || s.planned_duration_seconds),
    0
  );
  const totalCompletedMinutes = Math.round(totalCompletedSeconds / 60);

  // 2. Weekly breakdown: Monday through Sunday
  const currentDayOfWeek = (mockNow.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const monday = new Date(mockNow);
  monday.setDate(mockNow.getDate() - currentDayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyDays = dayLabels.map((name, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    const dateStr = d.toISOString().slice(0, 10);
    const isToday = d.toDateString() === mockNow.toDateString();

    const daySessions = completedFocus.filter((s) => {
      const sessDate = new Date(s.started_at);
      return sessDate.toDateString() === d.toDateString();
    });

    const daySeconds = daySessions.reduce(
      (sum, s) => sum + (s.actual_duration_seconds || s.planned_duration_seconds),
      0
    );

    return {
      dayName: name,
      dateStr,
      totalMinutes: Math.round(daySeconds / 60),
      isToday,
    };
  });

  return {
    totalCompletedSessions,
    totalCompletedMinutes,
    weeklyDays,
  };
}

test('calculateProgressSummary: only counts completed focus sessions', () => {
  const sessions = [
    {
      id: '1',
      session_type: 'focus',
      status: 'completed',
      actual_duration_seconds: 1500, // 25 mins
      started_at: '2026-10-29T10:00:00Z',
    },
    {
      id: '2',
      session_type: 'focus',
      status: 'cancelled', // Cancelled early
      actual_duration_seconds: 400,
      started_at: '2026-10-29T10:30:00Z',
    },
    {
      id: '3',
      session_type: 'break', // Break session
      status: 'completed',
      actual_duration_seconds: 300,
      started_at: '2026-10-29T10:40:00Z',
    },
    {
      id: '4',
      session_type: 'focus',
      status: 'completed',
      actual_duration_seconds: 2700, // 45 mins
      started_at: '2026-10-29T11:00:00Z',
    },
  ];

  const summary = calculateProgressSummary(sessions, new Date('2026-10-29T12:00:00Z'));

  // Should count only sessions 1 and 4
  assert.equal(summary.totalCompletedSessions, 2);
  assert.equal(summary.totalCompletedMinutes, 70); // 25 + 45 = 70 mins
});

test('calculateProgressSummary: correctly groups sessions by day in weekly chart', () => {
  // 2026-10-29 is a Thursday
  const sessions = [
    {
      id: '1',
      session_type: 'focus',
      status: 'completed',
      actual_duration_seconds: 1500, // 25 mins on Thursday
      started_at: '2026-10-29T09:00:00Z',
    },
    {
      id: '2',
      session_type: 'focus',
      status: 'completed',
      actual_duration_seconds: 3600, // 60 mins on Wednesday (2026-10-28)
      started_at: '2026-10-28T14:00:00Z',
    },
  ];

  const summary = calculateProgressSummary(sessions, new Date('2026-10-29T12:00:00Z'));
  const wed = summary.weeklyDays.find((d) => d.dayName === 'Wed');
  const thu = summary.weeklyDays.find((d) => d.dayName === 'Thu');
  const fri = summary.weeklyDays.find((d) => d.dayName === 'Fri');

  assert.equal(wed?.totalMinutes, 60);
  assert.equal(thu?.totalMinutes, 25);
  assert.equal(fri?.totalMinutes, 0);
  assert.equal(thu?.isToday, true);
});
