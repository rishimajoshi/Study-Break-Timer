'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTimer } from '@/hooks/useTimer';
import { useSessions } from '@/hooks/useSessions';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav, ActiveTab } from '@/components/layout/BottomNav';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { PresetSelector } from '@/components/timer/PresetSelector';
import { CustomDurationModal } from '@/components/timer/CustomDurationModal';
import { TaskInput } from '@/components/timer/TaskInput';
import { TimerControls } from '@/components/timer/TimerControls';
import { StopConfirmModal } from '@/components/timer/StopConfirmModal';
import { BreakModal } from '@/components/timer/BreakModal';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { WeeklyChart } from '@/components/profile/WeeklyChart';
import { CompletedSessionsList } from '@/components/profile/CompletedSessionsList';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { AuthCard } from '@/components/auth/AuthCard';
import { StudySession } from '@/types';

export default function StudyBreakTimerApp() {
  const {
    user,
    profile,
    isLoading: isAuthLoading,
    isConfigured,
    authError,
    authMessage,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('timer');
  const [showAuthScreen, setShowAuthScreen] = useState<boolean>(true);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [showStopModal, setShowStopModal] = useState<boolean>(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);

  // Hook for sessions
  const {
    sessions,
    isLoading: isSessionsLoading,
    summary,
    recordCompletedSession,
  } = useSessions(user?.id);

  // Callback when a session completes
  const handleSessionCompleted = useCallback(
    async (session: StudySession) => {
      await recordCompletedSession(session);
    },
    [recordCompletedSession]
  );

  // Hook for timer logic
  const {
    phase,
    status,
    remainingSeconds,
    totalDurationSeconds,
    progressPercent,
    focusPresetMinutes,
    breakMinutes,
    taskTitle,
    setTaskTitle,
    selectPreset,
    setCustomDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    startBreak,
    startNextFocusSession,
    showCompletionModal,
    setShowCompletionModal,
    breakSuggestion,
  } = useTimer({
    onSessionCompleted: handleSessionCompleted,
    defaultFocusMinutes: 25,
    defaultBreakMinutes: 5,
  });

  const handleConfirmStop = () => {
    setShowStopModal(false);
    stopTimer();
  };

  const handleSignOut = async () => {
    await signOut();
    setActiveTab('timer');
    setShowAuthScreen(true);
  };

  // If user is not authenticated and has not chosen guest mode yet
  if (!isAuthLoading && !user && showAuthScreen) {
    return (
      <main className="min-h-screen bg-brand-bg flex flex-col justify-center items-center p-4 sm:p-6">
        <AuthCard
          onSignIn={async (email, pass) => {
            const res = await signIn(email, pass);
            if (res.success) setShowAuthScreen(false);
            return res;
          }}
          onSignUp={async (email, pass, name) => {
            const res = await signUp(email, pass, name);
            if (res.success) setShowAuthScreen(false);
            return res;
          }}
          onSignInWithGoogle={signInWithGoogle}
          onResetPassword={resetPassword}
          authError={authError}
          authMessage={authMessage}
          isLoading={isAuthLoading}
          isConfigured={isConfigured}
          onContinueAsGuest={() => setShowAuthScreen(false)}
          onClose={() => setShowAuthScreen(false)}
        />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-blue-soft selection:text-brand-blue">
      {/* Top Application Header */}
      <AppHeader
        phase={phase}
        isLoggedIn={Boolean(user)}
        userEmail={user?.email}
        onSignOut={handleSignOut}
        onOpenAuth={() => setShowAuthScreen(true)}
        isLocalMode={!isConfigured}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-24">
        {activeTab === 'timer' ? (
          <section aria-labelledby="timer-heading" className="flex flex-col items-center">
            {/* Screen Title */}
            <h1
              id="timer-heading"
              className="text-center text-xs font-black tracking-widest text-brand-navy uppercase mb-1"
            >
              TIMER
            </h1>
            <p className="text-center text-xs text-brand-muted mb-3">
              Find your rhythm of study and mindful rest
            </p>

            {/* MM:SS Countdown with Circular Ring */}
            <TimerDisplay
              remainingSeconds={remainingSeconds}
              totalDurationSeconds={totalDurationSeconds}
              progressPercent={progressPercent}
              phase={phase}
              status={status}
            />

            {/* Preset Selector */}
            <PresetSelector
              currentPresetMinutes={focusPresetMinutes}
              totalDurationSeconds={totalDurationSeconds}
              status={status}
              onSelectPreset={selectPreset}
              onOpenCustomModal={() => setShowCustomModal(true)}
            />

            {/* Optional Task Goal Input */}
            <TaskInput
              taskTitle={taskTitle}
              status={status}
              onChangeTask={setTaskTitle}
            />

            {/* Action Controls */}
            <TimerControls
              phase={phase}
              status={status}
              onStart={startTimer}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onStopClick={() => setShowStopModal(true)}
            />
          </section>
        ) : (
          <section aria-labelledby="profile-heading">
            {/* Screen Title */}
            <h1
              id="profile-heading"
              className="text-center text-xs font-black tracking-widest text-brand-navy uppercase mb-1"
            >
              PROFILE
            </h1>
            <p className="text-center text-xs text-brand-muted mb-4">
              Your study habits and completed achievements
            </p>

            {/* Profile Information Card */}
            <ProfileCard
              profile={profile}
              userEmail={user?.email}
              isLoggedIn={Boolean(user)}
              onOpenEdit={() => setShowEditProfileModal(true)}
              onOpenAuth={() => setShowAuthScreen(true)}
            />

            {/* Weekly Progress Bar Chart & Metrics */}
            <WeeklyChart summary={summary} />

            {/* Completed Sessions History List */}
            <CompletedSessionsList
              sessions={sessions}
              isLoading={isSessionsLoading}
            />
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Custom Duration Modal */}
      <CustomDurationModal
        isOpen={showCustomModal}
        totalDurationSeconds={totalDurationSeconds}
        onClose={() => setShowCustomModal(false)}
        onApply={(h, m, s) => setCustomDuration(h, m, s)}
      />

      {/* Stop Session Early Confirmation Dialog */}
      <StopConfirmModal
        isOpen={showStopModal}
        onCancel={() => setShowStopModal(false)}
        onConfirmStop={handleConfirmStop}
      />

      {/* Break & Focus Completion Modal */}
      <BreakModal
        isOpen={showCompletionModal}
        phase={phase}
        taskTitle={taskTitle}
        breakSuggestion={breakSuggestion}
        defaultBreakMinutes={breakMinutes}
        onStartBreak={(mins) => startBreak(mins)}
        onSkipBreak={() => {
          setShowCompletionModal(false);
          startNextFocusSession();
        }}
        onClose={() => setShowCompletionModal(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        profile={profile}
        onClose={() => setShowEditProfileModal(false)}
        onSave={updateProfile}
      />
    </div>
  );
}
