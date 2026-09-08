import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Warning,
  Sparkle,
  Copy,
  Check,
  ShieldCheck,
  Info,
  Images,
  UserCheck,
  Camera
} from '@phosphor-icons/react';
import { compareFaceBiometrics, analyzeSecondaryPhotos } from '../../utils/faceBiometrics';

/**
 * Evaluates a verification request and produces an actionable decision with clear rationale,
 * factoring in both primary selfie matching and secondary photo (slots 2-6) biometric & lifestyle analysis.
 */
export const getVerificationRecommendation = (request, asyncSimilarity = null, secondaryAnalysis = null) => {
  const hasSelfie = Boolean(request?.selfieUrl && String(request.selfieUrl).trim());
  const refPhoto = request?.referenceUrl || request?.profilePhotos?.[0] || null;
  const hasReference = Boolean(refPhoto && typeof refPhoto === 'string' && refPhoto.trim());
  const failReason = request?.autoFailReason ? String(request.autoFailReason).trim() : null;

  // 1. Missing selfie
  if (!hasSelfie) {
    return {
      decision: 'REJECT',
      decisionLabel: 'SUGGESTION: REJECT',
      confidence: 'High Confidence',
      title: 'Missing Live Selfie',
      reason: 'No live camera selfie was submitted with this request. Identity cannot be validated without an image.',
      suggestedNote: 'Rejected: No live selfie image provided.',
      variant: 'reject',
    };
  }

  // 2. Missing profile reference photo
  if (!hasReference) {
    return {
      decision: 'REJECT',
      decisionLabel: 'SUGGESTION: REJECT',
      confidence: 'High Confidence',
      title: 'Missing Profile Photo Reference',
      reason: 'The member has not uploaded any profile pictures yet. There is no reference photo on file to compare the selfie against.',
      suggestedNote: 'Rejected: Please upload a clear profile photo first before requesting verification.',
      variant: 'reject',
    };
  }

  // 3. Automated check flags / autoFailReason
  if (failReason) {
    const lower = failReason.toLowerCase();

    // High risk: spoofing, screens, non-live presentation
    if (lower.includes('spoof') || lower.includes('screen') || lower.includes('presence') || lower.includes('static')) {
      return {
        decision: 'REJECT',
        decisionLabel: 'SUGGESTION: REJECT',
        confidence: 'High Risk (Spoofing Flagged)',
        title: 'Anti-Spoofing Alert',
        reason: `Automated liveness check flagged: "${failReason}". The capture exhibits characteristics of a digital screen or non-live photo rather than a direct face scan.`,
        suggestedNote: `Rejected: Live presence could not be confirmed (${failReason}).`,
        variant: 'reject',
      };
    }

    // High risk: biometric face mismatch / catfish
    if (lower.includes('mismatch') || lower.includes('catfish') || lower.includes('different') || lower.includes('own face')) {
      return {
        decision: 'REJECT',
        decisionLabel: 'SUGGESTION: REJECT',
        confidence: 'Discrepancy Flagged',
        title: 'Biometric Face Mismatch',
        reason: `Facial discrepancy detected: "${failReason}". Anatomical landmarks (jawline, eye spacing, nose bridge) differ significantly between the live selfie and the profile photo.`,
        suggestedNote: 'Rejected: Live selfie does not match the person shown on the profile.',
        variant: 'reject',
      };
    }

    // Occlusion: sunglasses, masks, hands covering face
    if (lower.includes('occlu') || lower.includes('mask') || lower.includes('sunglass') || lower.includes('covered')) {
      return {
        decision: 'REJECT',
        decisionLabel: 'SUGGESTION: REJECT',
        confidence: 'Facial Occlusion',
        title: 'Facial Features Obstructed',
        reason: `Occlusion detected: "${failReason}". Key facial features (eyes, nose, mouth) are covered by sunglasses, a mask, or hands, preventing positive verification.`,
        suggestedNote: 'Rejected: Please remove sunglasses, masks, or items obstructing your face.',
        variant: 'reject',
      };
    }

    // Low clarity / blur / darkness
    if (lower.includes('blur') || lower.includes('dark') || lower.includes('lighting') || lower.includes('shadow')) {
      return {
        decision: 'REJECT',
        decisionLabel: 'SUGGESTION: REJECT',
        confidence: 'Low Image Clarity',
        title: 'Insufficient Image Quality',
        reason: `Image clarity issue: "${failReason}". The selfie is too dark, blurry, or washed out to confirm facial landmarks with high confidence.`,
        suggestedNote: 'Rejected: Image was too dark or blurry. Please take a selfie in bright, even lighting.',
        variant: 'reject',
      };
    }

    // Minor angle / pose variance
    if (lower.includes('angle') || lower.includes('variance') || lower.includes('roll') || lower.includes('pitch') || lower.includes('demo')) {
      return {
        decision: 'REVIEW',
        decisionLabel: 'SUGGESTION: REVIEW & LIKELY APPROVE',
        confidence: 'Minor Variance',
        title: 'Pose/Angle Variance Flagged',
        reason: `Automated filter flagged minor head angle/pose variance: "${failReason}". If you visually confirm that both photos show the same person, you can safely approve this request.`,
        suggestedNote: 'Approved: Verified identity visually despite minor head angle variance.',
        variant: 'review',
      };
    }

    // Generic auto-fail reason
    return {
      decision: 'REVIEW',
      decisionLabel: 'SUGGESTION: REVIEW CAREFULLY',
      confidence: 'Flagged For Review',
      title: 'Review Warning',
      reason: `Automated scanner noted: "${failReason}". Please inspect both photos carefully before making a final determination.`,
      suggestedNote: `Reviewed: Evaluated automated flag (${failReason}).`,
      variant: 'review',
    };
  }

  // 4. Client-side biometric comparison discrepancy on primary photo
  if (asyncSimilarity !== null) {
    if (asyncSimilarity.isMismatch) {
      return {
        decision: 'REJECT',
        decisionLabel: 'SUGGESTION: REJECT',
        confidence: `${Math.round((1 - (asyncSimilarity.similarity || 0.5)) * 100)}% Discrepancy`,
        title: 'Biometric Mismatch Detected',
        reason: asyncSimilarity.reason || 'Biometric analysis detected substantial morphological differences between the selfie and primary profile picture.',
        suggestedNote: 'Rejected: Facial biometric landmarks do not match profile photo.',
        variant: 'reject',
      };
    }
  }

  // 5. Check secondary photos (slots 2-6)
  if (secondaryAnalysis?.hasDifferentFace) {
    const diffItems = (secondaryAnalysis.results || []).filter(r => r.category === 'different_face');
    const diffSlots = diffItems.map(d => `#${d.slotNumber}`).join(', ');
    return {
      decision: 'REVIEW',
      decisionLabel: 'SUGGESTION: REVIEW CAREFULLY',
      confidence: 'Secondary Photo Discrepancy',
      title: 'Different Person in Secondary Photos',
      reason: `Selfie matches Photo #1, but Photo ${diffSlots} contains a distinct face that does not match the member. Please visually confirm if this is a group/friend photo or an unrelated person before approving.`,
      suggestedNote: `Reviewed: Verified Photo #1 match. Inspected Photo ${diffSlots} manually.`,
      variant: 'review',
    };
  }

  // 6. Normal healthy verification with live selfie and clear profile photo
  let secondarySummary = '';
  if (secondaryAnalysis?.totalSecondary > 0) {
    const parts = [];
    if (secondaryAnalysis.matchingFaceCount > 0) {
      parts.push(`${secondaryAnalysis.matchingFaceCount} face match`);
    }
    if (secondaryAnalysis.lifestyleCount > 0) {
      parts.push(`${secondaryAnalysis.lifestyleCount} lifestyle/scenery`);
    }
    secondarySummary = parts.length > 0 ? ` Secondary photos (2–${secondaryAnalysis.totalSecondary + 1}): ${parts.join(', ')}.` : '';
  }

  return {
    decision: 'APPROVE',
    decisionLabel: 'SUGGESTION: APPROVE',
    confidence: 'High Confidence Match',
    title: 'Authentic Match Detected',
    reason: `Live camera selfie matches the primary profile picture. Clean facial centering, natural lighting, and no biometric spoofing detected.${secondarySummary} Safe to approve.`,
    suggestedNote: 'Approved: Verified live selfie matches profile photo.',
    variant: 'approve',
  };
};

export const AdminVerificationRecommendation = ({ request, onApplyReason }) => {
  const [asyncComparison, setAsyncComparison] = useState(null);
  const [secondaryAnalysis, setSecondaryAnalysis] = useState(null);
  const [copiedNote, setCopiedNote] = useState(false);

  const refPhoto = request?.referenceUrl || request?.profilePhotos?.[0] || null;

  // 1. Primary photo biometric comparison
  useEffect(() => {
    let isMounted = true;
    if (request?.selfieUrl && refPhoto && !request?.autoFailReason) {
      compareFaceBiometrics(request.selfieUrl, refPhoto)
        .then((res) => {
          if (isMounted && res) setAsyncComparison(res);
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [request?.selfieUrl, refPhoto, request?.autoFailReason]);

  // 2. Secondary photos (2 to 6) automated biometric & lifestyle classification
  useEffect(() => {
    let isMounted = true;
    if (Array.isArray(request?.profilePhotos) && request.profilePhotos.length > 1) {
      analyzeSecondaryPhotos(request.profilePhotos, refPhoto)
        .then((analysis) => {
          if (isMounted && analysis) setSecondaryAnalysis(analysis);
        })
        .catch(() => {});
    } else {
      setSecondaryAnalysis(null);
    }
    return () => {
      isMounted = false;
    };
  }, [request?.profilePhotos, refPhoto]);

  const rec = getVerificationRecommendation(request, asyncComparison, secondaryAnalysis);

  const handleApplyNote = () => {
    if (onApplyReason && rec.suggestedNote) {
      onApplyReason(rec.suggestedNote);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2200);
    }
  };

  const getIcon = () => {
    if (rec.variant === 'approve') {
      return <CheckCircle size={18} weight="fill" className="admin-rec-icon icon-approve" />;
    }
    if (rec.variant === 'reject') {
      return <XCircle size={18} weight="fill" className="admin-rec-icon icon-reject" />;
    }
    return <Warning size={18} weight="fill" className="admin-rec-icon icon-review" />;
  };

  return (
    <div className={`admin-rec-card variant-${rec.variant}`}>
      <div className="admin-rec-header">
        <div className="admin-rec-badge-wrap">
          {getIcon()}
          <span className={`admin-rec-decision-pill pill-${rec.variant}`}>
            {rec.decisionLabel}
          </span>
          <span className="admin-rec-confidence font-ui">
            {rec.confidence}
          </span>
        </div>

        {rec.suggestedNote && onApplyReason && (
          <button
            type="button"
            onClick={handleApplyNote}
            className="admin-rec-apply-btn font-ui"
            title="Insert this recommendation directly into the Admin review notes input below"
          >
            {copiedNote ? (
              <>
                <Check size={13} weight="bold" />
                <span>Inserted in Notes</span>
              </>
            ) : (
              <>
                <Copy size={13} weight="bold" />
                <span>Use as Note</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="admin-rec-body font-ui">
        <div className="admin-rec-why-row">
          <strong className="admin-rec-why-tag">Why:</strong>
          <span className="admin-rec-why-text">{rec.reason}</span>
        </div>

        {/* Secondary Photos Breakdown Bar (slots 2-6) */}
        {secondaryAnalysis && secondaryAnalysis.totalSecondary > 0 && (
          <div className="admin-rec-secondary-row">
            <span className="admin-rec-sec-title">
              <Images size={14} weight="bold" />
              <span>Photos 2–{secondaryAnalysis.totalSecondary + 1} AI Scan:</span>
            </span>
            <div className="admin-rec-chips-wrap">
              {secondaryAnalysis.results.map((item) => {
                let badgeClass = 'chip-info';
                if (item.category === 'matching_face') badgeClass = 'chip-success';
                if (item.category === 'different_face') badgeClass = 'chip-warning';

                return (
                  <span
                    key={item.index}
                    className={`admin-rec-chip ${badgeClass}`}
                    title={item.reason}
                  >
                    <strong>Photo #{item.slotNumber}:</strong> {item.badge}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
