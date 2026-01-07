import { useState, ReactNode } from 'react';
import { usePWAAccess, PWARequiredFeature } from '@/hooks/usePWAAccess';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAFeatureGuardProps {
  children: ReactNode;
  feature: PWARequiredFeature;
  featureDisplayName?: string;
  onContinueDemo?: () => void;
  fallback?: ReactNode;
}

/**
 * Wraps a feature that requires PWA installation on mobile.
 * Shows the install modal when a mobile browser user tries to access it.
 */
export const PWAFeatureGuard = ({
  children,
  feature,
  featureDisplayName,
  onContinueDemo,
  fallback,
}: PWAFeatureGuardProps) => {
  const { canAccessFeature, requiresPWAForFeature, isLoading } = usePWAAccess();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  // If still loading, show children optimistically
  if (isLoading) {
    return <>{children}</>;
  }

  // If user can access, show children
  if (canAccessFeature(feature)) {
    return <>{children}</>;
  }

  // If PWA is required and we haven't shown modal yet
  if (requiresPWAForFeature(feature) && !hasTriggered) {
    // Show modal on first render
    setTimeout(() => {
      setShowInstallModal(true);
      setHasTriggered(true);
    }, 0);
  }

  // Show fallback or nothing while modal is displayed
  return (
    <>
      {fallback || null}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        featureName={featureDisplayName}
        onContinueDemo={onContinueDemo ? () => {
          setShowInstallModal(false);
          onContinueDemo();
        } : undefined}
      />
    </>
  );
};

/**
 * Hook to manually trigger the PWA install modal for a feature
 */
export const usePWAFeatureCheck = () => {
  const { canAccessFeature, requiresPWAForFeature } = usePWAAccess();
  const [showModal, setShowModal] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<{
    feature: PWARequiredFeature;
    displayName?: string;
    onContinue?: () => void;
  } | null>(null);

  const checkFeatureAccess = (
    feature: PWARequiredFeature,
    displayName?: string,
    onContinue?: () => void
  ): boolean => {
    if (canAccessFeature(feature)) {
      return true;
    }
    
    if (requiresPWAForFeature(feature)) {
      setCurrentFeature({ feature, displayName, onContinue });
      setShowModal(true);
      return false;
    }
    
    return true;
  };

  const InstallModal = () => (
    <PWAInstallModal
      isOpen={showModal}
      onClose={() => {
        setShowModal(false);
        setCurrentFeature(null);
      }}
      featureName={currentFeature?.displayName}
      onContinueDemo={currentFeature?.onContinue ? () => {
        setShowModal(false);
        currentFeature?.onContinue?.();
        setCurrentFeature(null);
      } : undefined}
    />
  );

  return {
    checkFeatureAccess,
    InstallModal,
    isModalOpen: showModal,
  };
};
