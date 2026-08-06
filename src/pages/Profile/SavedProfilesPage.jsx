import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/UI/PageHeader';
import { ProfileCard } from '../../components/UI/ProfileCard';
import { EmptyState } from '../../components/UI/EmptyState';
import { Bookmark } from '@phosphor-icons/react';

export const SavedProfilesPage = ({ onBack, onSelectProfile }) => {
  const { 
    savedProfileObjects = [], 
    savedProfiles = [], 
    toggleSaveProfile, 
    interestsSent = [], 
    sendInterest, 
    blockUser, 
    reportUser 
  } = useApp();

  return (
    <div className="saved-profiles-page page-enter">
      <PageHeader
        title="Saved Profiles"
        subtitle="Profiles you have bookmarked to revisit or connect with later."
        onBack={onBack}
      />

      {savedProfileObjects.length > 0 ? (
        <div className="saved-profiles-grid">
          {savedProfileObjects.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isInterestSent={interestsSent.includes(profile.id)}
              isSaved={savedProfiles.includes(profile.id)}
              onSendInterest={sendInterest}
              onSave={(id) => toggleSaveProfile(id, profile)}
              onBlock={blockUser}
              onReport={(id) => {
                const reason = window.prompt(`Report ${profile.name} - Enter reason:`);
                if (reason) reportUser(id, 'Reported from Saved Profiles', reason);
              }}
              onClick={() => {
                if (onSelectProfile) onSelectProfile(profile);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No saved profiles"
          desc="Profiles you bookmark on Discover will appear here so you can revisit them anytime."
          icon={<Bookmark size={40} className="font-accent" />}
          actionLabel="Go to Profile"
          onActionClick={onBack}
        />
      )}

      <style>{`
        .saved-profiles-page {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--space-4);
        }

        .saved-profiles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-6);
        }
      `}</style>
    </div>
  );
};
