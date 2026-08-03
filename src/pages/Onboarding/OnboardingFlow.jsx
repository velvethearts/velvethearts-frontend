import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Camera, Info, X } from '@phosphor-icons/react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Textarea } from '../../components/UI/Textarea';
import { Select } from '../../components/UI/Select';
import { PageHeader } from '../../components/UI/PageHeader';
import { getDefaultAvatar } from '../../utils/avatar';

export const OnboardingFlow = () => {
    const { completeOnboarding, logout } = useApp();

    const DRAFT_KEY = 'vh-onboarding-draft';

    const loadDraft = () => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    };
    const draft = loadDraft();

    const [step, setStep] = useState(draft?.step || 1);
    console.log("ONBOARDINGFLOW_MOUNT_TEST: OnboardingFlow rendering, step =", step);
    const [formData, setFormData] = useState(draft?.formData || {
        name: '',
        dobDay: '',
        dobMonth: '',
        dobYear: '',
        city: '',
        gender: 'Woman',
        showGender: true,
        orientation: 'Straight',
        showOrientation: true,
        relationshipIntent: 'Long-term Relationship',
        relationshipStatus: 'Single',
        interests: [],
        story: '',
        hasDisability: false,
        disabilityInfo: '',
        showDisability: false,
        photos: []
    });

    const [photoPreviews, setPhotoPreviews] = useState(draft?.photoPreviews || []);
    const [customGenderText, setCustomGenderText] = useState(draft?.customGenderText || '');
    const [customOrientationText, setCustomOrientationText] = useState(draft?.customOrientationText || '');
    const [validationErrors, setValidationErrors] = useState({});
    const [showAllErrors, setShowAllErrors] = useState(false);
    const [showDraftBanner, setShowDraftBanner] = useState(!!draft);

    const handleStartFresh = () => {
        if (window.confirm('Discard your saved progress and start the profile from the beginning?')) {
            try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
            setFormData({
                name: '', dobDay: '', dobMonth: '', dobYear: '', city: '',
                gender: 'Woman', showGender: true, orientation: 'Straight', showOrientation: true,
                relationshipIntent: 'Long-term Relationship', relationshipStatus: 'Single',
                interests: [], story: '', hasDisability: false, disabilityInfo: '',
                showDisability: false, photos: []
            });
            setPhotoPreviews([]);
            setCustomGenderText('');
            setCustomOrientationText('');
            setStep(1);
            setShowDraftBanner(false);
        }
    };

    // Autosave the draft to localStorage whenever the meaningful bits change.
    // Photos are lightweight Cloudinary URLs (not base64), so this is cheap.
    useEffect(() => {
        const timeout = setTimeout(() => {
            try {
                localStorage.setItem(DRAFT_KEY, JSON.stringify({
                    step, formData, photoPreviews, customGenderText, customOrientationText
                }));
            } catch (e) {
                // Storage full or unavailable — not fatal, just skip autosave
                console.warn('Could not save onboarding draft:', e);
            }
        }, 400);
        return () => clearTimeout(timeout);
    }, [step, formData, photoPreviews, customGenderText, customOrientationText]);

    const isDev = import.meta.env.DEV;

    const genderOptions = [
        'Woman', 'Man', 'Non-binary', 'Genderqueer', 'Genderfluid',
        'Agender', 'Trans Woman', 'Trans Man', 'Two-Spirit', 'Prefer to self-describe'
    ];

    const orientationOptions = [
        'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual',
        'Asexual', 'Queer', 'Questioning', 'Demisexual', 'Prefer to self-describe'
    ];

    const interestOptions = [
        'Books', 'Music', 'Art', 'Nature', 'Movies', 'Food',
        'Fitness', 'Travel', 'Games', 'Photo', 'Wellness', 'Animals',
        'Technology', 'Sports', 'Theater', 'Social Causes', 'Podcasts'
    ];

    const intentionOptions = [
        { value: 'Long-term Relationship', label: '♡ Long-term Relationship', desc: 'Looking for something lasting' },
        { value: 'Getting to Know People', label: '◇ Getting to Know People', desc: 'Open to seeing where things go' },
        { value: 'Companionship', label: '☆ Companionship', desc: 'Seeking meaningful friendship' },
        { value: 'Open to Anything Meaningful', label: '∞ Open to Anything Meaningful', desc: 'No specific expectations' }
    ];

    const statusOptions = ['Single', 'Separated', "It's Complicated", 'Divorced', 'Widowed'];

    // Reset showAllErrors when step changes
    useEffect(() => {
        setShowAllErrors(false);
    }, [step]);

    // Track validation changes live
    // useEffect(() => {
    //     validateStepFields();
    // }, [formData, customGenderText, customOrientationText, photoPreviews, step, showAllErrors]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleInterestToggle = (interest) => {
        setFormData(prev => {
            const current = prev.interests;
            if (current.includes(interest)) {
                return { ...prev, interests: current.filter(i => i !== interest) };
            } else {
                return { ...prev, interests: [...current, interest] };
            }
        });
    };

    const [uploadingCount, setUploadingCount] = useState(0);
    const [photoUploadError, setPhotoUploadError] = useState('');

    const handlePhotoUpload = async (e) => {
        const remainingSlots = 6 - photoPreviews.length;
        const files = Array.from(e.target.files).slice(0, remainingSlots);
        e.target.value = ''; // allow re-selecting the same file later
        if (files.length === 0) return;

        setPhotoUploadError('');
        setUploadingCount(prev => prev + files.length);

        for (const file of files) {
            try {
                // Upload to Cloudinary via the backend and store only the
                // returned secure URL — never send raw/base64 image data
                // in the profile save payload, it blows past the JSON
                // body-size limit (especially full-resolution phone photos).
                const result = await api.uploadPhoto(file);
                setPhotoPreviews(prev => {
                    const next = [...prev, result.secureUrl].slice(0, 6);
                    handleChange('photos', next);
                    return next;
                });
            } catch (err) {
                console.error('Photo upload failed:', err);
                setPhotoUploadError(err.message || 'Failed to upload photo. Please try again.');
            } finally {
                setUploadingCount(prev => Math.max(0, prev - 1));
            }
        }
    };

    const removePhoto = (index) => {
        setPhotoPreviews(prev => {
            const next = prev.filter((_, i) => i !== index);
            handleChange('photos', next);
            return next;
        });
    };

    // ── Geometry-based layout-aware focus navigation ─────────
    const focusAdjacentItem = (container, key) => {
        const buttons = Array.from(container.querySelectorAll('.selection-chip, .radio-selection-card'));
        if (buttons.length === 0) return;

        const focused = document.activeElement;
        let currentIndex = buttons.indexOf(focused);
        if (currentIndex < 0) currentIndex = 0;

        const currentEl = buttons[currentIndex];
        const currentCenterX = currentEl.offsetLeft + currentEl.offsetWidth / 2;
        const currentTop = currentEl.offsetTop;
        const rowThreshold = Math.max(8, currentEl.offsetHeight * 0.4);

        let nextIndex = -1;

        if (key === 'ArrowRight') {
            const sameRow = buttons.map((b, i) => ({ b, i }))
                .filter(({ b, i }) => i !== currentIndex && Math.abs(b.offsetTop - currentTop) < rowThreshold);
            const rightItems = sameRow
                .filter(({ b }) => b.offsetLeft > currentEl.offsetLeft)
                .sort((a, b_) => a.b.offsetLeft - b_.b.offsetLeft);
            if (rightItems.length > 0) {
                nextIndex = rightItems[0].i;
            } else {
                // Wrap to first item on next row below, or wrap to beginning
                const belowRows = buttons.map((b, i) => ({ b, i }))
                    .filter(({ b, i }) => b.offsetTop > currentTop + rowThreshold)
                    .sort((a, b_) => a.b.offsetTop - b_.b.offsetTop || a.b.offsetLeft - b_.b.offsetLeft);
                nextIndex = belowRows.length > 0 ? belowRows[0].i : 0;
            }
        } else if (key === 'ArrowLeft') {
            const sameRow = buttons.map((b, i) => ({ b, i }))
                .filter(({ b, i }) => i !== currentIndex && Math.abs(b.offsetTop - currentTop) < rowThreshold);
            const leftItems = sameRow
                .filter(({ b }) => b.offsetLeft < currentEl.offsetLeft)
                .sort((a, b_) => b_.b.offsetLeft - a.b.offsetLeft);
            if (leftItems.length > 0) {
                nextIndex = leftItems[0].i;
            } else {
                // Wrap to last item on row above, or wrap to end
                const aboveRows = buttons.map((b, i) => ({ b, i }))
                    .filter(({ b, i }) => b.offsetTop < currentTop - rowThreshold)
                    .sort((a, b_) => b_.b.offsetTop - a.b.offsetTop || b_.b.offsetLeft - a.b.offsetLeft);
                nextIndex = aboveRows.length > 0 ? aboveRows[0].i : buttons.length - 1;
            }
        } else if (key === 'ArrowDown') {
            const belowItems = buttons.map((b, i) => ({ b, i }))
                .filter(({ b, i }) => b.offsetTop > currentTop + rowThreshold);
            if (belowItems.length > 0) {
                const minTop = Math.min(...belowItems.map(({ b }) => b.offsetTop));
                const nextRow = belowItems.filter(({ b }) => Math.abs(b.offsetTop - minTop) < rowThreshold);
                nextRow.sort((a, b_) =>
                    Math.abs((a.b.offsetLeft + a.b.offsetWidth / 2) - currentCenterX) -
                    Math.abs((b_.b.offsetLeft + b_.b.offsetWidth / 2) - currentCenterX)
                );
                nextIndex = nextRow[0].i;
            } else {
                nextIndex = 0; // wrap to first
            }
        } else if (key === 'ArrowUp') {
            const aboveItems = buttons.map((b, i) => ({ b, i }))
                .filter(({ b, i }) => b.offsetTop < currentTop - rowThreshold);
            if (aboveItems.length > 0) {
                const maxTop = Math.max(...aboveItems.map(({ b }) => b.offsetTop));
                const prevRow = aboveItems.filter(({ b }) => Math.abs(b.offsetTop - maxTop) < rowThreshold);
                prevRow.sort((a, b_) =>
                    Math.abs((a.b.offsetLeft + a.b.offsetWidth / 2) - currentCenterX) -
                    Math.abs((b_.b.offsetLeft + b_.b.offsetWidth / 2) - currentCenterX)
                );
                nextIndex = prevRow[0].i;
            } else {
                nextIndex = buttons.length - 1; // wrap to last
            }
        }

        if (nextIndex >= 0 && nextIndex < buttons.length) {
            buttons[nextIndex].focus();
        }
    };

    // Arrow keys: move focus only. Enter/Space/click: select.
    const handleGroupKeyDown = (e) => {
        const key = e.key;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
            e.preventDefault();
            focusAdjacentItem(e.currentTarget, key);
        }
    };

    // Arrow keys on multi-select interest chips: move focus, update roving tabIndex.
    const handleInterestKeyDown = (e) => {
        const key = e.key;
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) return;
        e.preventDefault();
        const container = e.currentTarget;
        const buttons = Array.from(container.querySelectorAll('.selection-chip'));
        if (buttons.length === 0) return;

        const focused = document.activeElement;
        let currentIndex = buttons.indexOf(focused);
        if (currentIndex < 0) currentIndex = 0;

        const currentEl = buttons[currentIndex];
        const currentCenterX = currentEl.offsetLeft + currentEl.offsetWidth / 2;
        const currentTop = currentEl.offsetTop;
        const rowThreshold = Math.max(8, currentEl.offsetHeight * 0.4);
        let nextIndex = -1;

        if (key === 'ArrowRight') {
            const sameRow = buttons.map((b, i) => ({ b, i }))
                .filter(({ b, i }) => i !== currentIndex && Math.abs(b.offsetTop - currentTop) < rowThreshold);
            const rightItems = sameRow.filter(({ b }) => b.offsetLeft > currentEl.offsetLeft)
                .sort((a, b_) => a.b.offsetLeft - b_.b.offsetLeft);
            nextIndex = rightItems.length > 0 ? rightItems[0].i : (currentIndex + 1) % buttons.length;
        } else if (key === 'ArrowLeft') {
            const sameRow = buttons.map((b, i) => ({ b, i }))
                .filter(({ b, i }) => i !== currentIndex && Math.abs(b.offsetTop - currentTop) < rowThreshold);
            const leftItems = sameRow.filter(({ b }) => b.offsetLeft < currentEl.offsetLeft)
                .sort((a, b_) => b_.b.offsetLeft - a.b.offsetLeft);
            nextIndex = leftItems.length > 0 ? leftItems[0].i : (currentIndex - 1 + buttons.length) % buttons.length;
        } else if (key === 'ArrowDown') {
            const belowItems = buttons.map((b, i) => ({ b, i }))
                .filter(({ b, i }) => b.offsetTop > currentTop + rowThreshold);
            if (belowItems.length > 0) {
                const minTop = Math.min(...belowItems.map(({ b }) => b.offsetTop));
                const nextRow = belowItems.filter(({ b }) => Math.abs(b.offsetTop - minTop) < rowThreshold);
                nextRow.sort((a, b_) =>
                    Math.abs((a.b.offsetLeft + a.b.offsetWidth / 2) - currentCenterX) -
                    Math.abs((b_.b.offsetLeft + b_.b.offsetWidth / 2) - currentCenterX)
                );
                nextIndex = nextRow[0].i;
            } else {
                nextIndex = 0;
            }
        } else if (key === 'ArrowUp') {
            const aboveItems = buttons.map((b, i) => ({ b, i }))
                .filter(({ b, i }) => b.offsetTop < currentTop - rowThreshold);
            if (aboveItems.length > 0) {
                const maxTop = Math.max(...aboveItems.map(({ b }) => b.offsetTop));
                const prevRow = aboveItems.filter(({ b }) => Math.abs(b.offsetTop - maxTop) < rowThreshold);
                prevRow.sort((a, b_) =>
                    Math.abs((a.b.offsetLeft + a.b.offsetWidth / 2) - currentCenterX) -
                    Math.abs((b_.b.offsetLeft + b_.b.offsetWidth / 2) - currentCenterX)
                );
                nextIndex = prevRow[0].i;
            } else {
                nextIndex = buttons.length - 1;
            }
        }

        if (nextIndex >= 0 && nextIndex < buttons.length) {
            // Update roving tabIndex directly on DOM nodes
            buttons.forEach((b, i) => { b.tabIndex = i === nextIndex ? 0 : -1; });
            buttons[nextIndex].focus();
        }
    };

    const handleFormKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (e.target.tagName === 'TEXTAREA' && e.shiftKey) {
                return;
            }
            if (e.target.tagName === 'TEXTAREA' && !e.shiftKey) {
                e.preventDefault();
                handleFormSubmit();
                return;
            }
            // If focused on a chip or radio card:
            const chipEl = e.target.classList.contains('selection-chip') ? e.target : e.target.closest('.selection-chip');
            const cardEl = e.target.classList.contains('radio-selection-card') ? e.target : e.target.closest('.radio-selection-card');
            if (chipEl || cardEl) {
                const el = cardEl || chipEl;
                const isAlreadyActive = el.classList.contains('active') || el.classList.contains('active-burgundy');
                if (isAlreadyActive && isStepValid()) {
                    // Already selected + step valid → advance
                    e.preventDefault();
                    handleFormSubmit();
                }
                // Not yet active → let native Enter trigger the button click to select it
                return;
            }
            e.preventDefault();
            handleFormSubmit();
        }
    };

    // Live validator
    const validateStepFields = (force = showAllErrors) => {
        const errors = {};

        if (step === 1) {
            if (force || formData.name) {
                if (!formData.name || !formData.name.trim()) {
                    errors.name = 'Name is required.';
                } else if (formData.name.trim().length < 2) {
                    errors.name = 'Name must be at least 2 characters.';
                } else if (formData.name.trim().length > 40) {
                    errors.name = 'Name must be 40 characters or fewer.';
                }
            }

            const day = parseInt(formData.dobDay, 10);
            const month = parseInt(formData.dobMonth, 10);
            const year = parseInt(formData.dobYear, 10);

            if (force || formData.dobDay || formData.dobMonth || formData.dobYear) {
                if (!formData.dobDay || !formData.dobMonth || !formData.dobYear) {
                    errors.dob = 'Date of birth is required.';
                } else if (isNaN(day) || day < 1 || day > 31) {
                    errors.dob = 'Please enter a valid day (1-31).';
                } else if (isNaN(month) || month < 1 || month > 12) {
                    errors.dob = 'Please select a valid month.';
                } else if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
                    errors.dob = 'Please enter a valid 4-digit birth year.';
                } else {
                    const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
                    const maxDays = (month === 2)
                        ? (isLeapYear(year) ? 29 : 28)
                        : ([4, 6, 9, 11].includes(month) ? 30 : 31);

                    if (day > maxDays) {
                        if (month === 2) {
                            errors.dob = isLeapYear(year)
                                ? 'February in a leap year only has up to 29 days.'
                                : 'February only has up to 28 days.';
                        } else {
                            errors.dob = `The selected month only has up to ${maxDays} days.`;
                        }
                    } else {
                        const birthDate = new Date(year, month - 1, day);
                        const today = new Date();

                        if (birthDate > today) {
                            errors.dob = 'Birth date cannot be in the future.';
                        } else {
                            let age = today.getFullYear() - birthDate.getFullYear();
                            const m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                            }
                            if (age < 18) {
                                errors.dob = 'You must be 18 or older to join Velvet Hearts.';
                            }
                        }
                    }
                }
            }

            if (force || formData.city) {
                if (!formData.city || !formData.city.trim()) {
                    errors.city = 'City is required.';
                } else if (formData.city.trim().length < 2) {
                    errors.city = 'City must be at least 2 characters.';
                }
            }
        }

            if (step === 2) {
                if (formData.gender === 'Prefer to self-describe' && !customGenderText.trim()) {
                    errors.gender = 'Please describe your gender identity.';
                }
                if (formData.orientation === 'Prefer to self-describe' && !customOrientationText.trim()) {
                    errors.orientation = 'Please describe your sexual orientation.';
                }
            }

            if (step === 4) {
                if (force || formData.interests.length > 0) {
                    if (formData.interests.length < 3) {
                        errors.interests = 'Select at least 3 things you love.';
                    }
                }
                if (force || formData.story) {
                    if (!formData.story || !formData.story.trim()) {
                        errors.story = 'Your story is required.';
                    } else if (formData.story.trim().length < 20) {
                        errors.story = `Story must be at least 20 characters (current: ${formData.story.trim().length}).`;
                    }
                }
            }

            if (step === 5) {
                if (force) {
                    if (photoPreviews.length < 1) {
                        errors.photos = 'Add at least 1 photo to publish your profile.';
                    }
                }
            }

            setValidationErrors(errors);
            return Object.keys(errors).length === 0;
        };

        const isStepValid = () => {
            // Structural checks to enable "Continue" button
            switch (step) {
                case 1: {
                    if (!formData.name || !formData.dobDay || !formData.dobMonth || !formData.dobYear || !formData.city) return false;
                    if (formData.name.trim().length < 2 || formData.name.trim().length > 40) return false;
                    const d = parseInt(formData.dobDay, 10);
                    const m = parseInt(formData.dobMonth, 10);
                    const y = parseInt(formData.dobYear, 10);
                    if (isNaN(d) || d < 1 || d > 31 || isNaN(m) || m < 1 || m > 12 || isNaN(y) || y < 1900 || y > new Date().getFullYear()) return false;
                    const isLeapYearVal = (yr) => (yr % 4 === 0 && yr % 100 !== 0) || (yr % 400 === 0);
                    const maxDaysVal = (m === 2)
                        ? (isLeapYearVal(y) ? 29 : 28)
                        : ([4, 6, 9, 11].includes(m) ? 30 : 31);
                    if (d > maxDaysVal) return false;
                    const bDate = new Date(y, m - 1, d);
                    const today = new Date();
                    if (bDate > today) return false;
                    let age = today.getFullYear() - bDate.getFullYear();
                    const monthDiff = today.getMonth() - bDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bDate.getDate())) {
                        age--;
                    }
                    if (age < 18) return false;
                    if (formData.city.trim().length < 2) return false;
                    return true;
                }
                case 2:
                    if (formData.gender === 'Prefer to self-describe' && !customGenderText.trim()) return false;
                    if (formData.orientation === 'Prefer to self-describe' && !customOrientationText.trim()) return false;
                    return true;
                case 3:
                    return !!(formData.relationshipIntent && formData.relationshipStatus);
                case 4:
                    return formData.interests.length >= 3 && formData.story.trim().length >= 20 && !validationErrors.story;
                case 5:
                    return photoPreviews.length >= 1 && uploadingCount === 0;
                case 6:
                    return true;
                default:
                    return false;
            }
        };

        const [submitting, setSubmitting] = useState(false);
        const [submitError, setSubmitError] = useState('');

        const handleFormSubmit = async (e) => {
            if (e) e.preventDefault();

            // Trigger submission errors if invalid
            if (!isStepValid()) {
                setShowAllErrors(true);
                validateStepFields(true);
                return;
            }

            setShowAllErrors(false);
            if (step < 6) {
                setStep(prev => prev + 1);
                window.scrollTo(0, 0);
            } else {
                const finalGender = formData.gender === 'Prefer to self-describe' ? customGenderText : formData.gender;
                const finalOrientation = formData.orientation === 'Prefer to self-describe' ? customOrientationText : formData.orientation;

                setSubmitting(true);
                setSubmitError('');

                try {
                    await completeOnboarding({
                        ...formData,
                        gender: finalGender,
                        orientation: finalOrientation,
                        photos: photoPreviews.length > 0 ? photoPreviews : [getDefaultAvatar(finalGender)]
                    });
                    try {
                        localStorage.removeItem(DRAFT_KEY);
                    } catch (e) {
                        // Non-fatal — draft cleanup is best-effort
                    }
                } catch (err) {
                    setSubmitError(err.message || 'Failed to save profile. Please try again.');
                } finally {
                    setSubmitting(false);
                }
            }
        };

        const handleBack = () => {
            if (step > 1) {
                setShowAllErrors(false);
                setStep(prev => prev - 1);
                window.scrollTo(0, 0);
            }
        };

        const handleBackToWelcome = async () => {
            setShowAllErrors(false);
            await logout();
            window.scrollTo(0, 0);
        };

        const progressPercentage = (step / 6) * 100;

        return (
            <div className="onboarding-page page-enter">
                {/* Reusable PageHeader for Alignment */}
                <PageHeader
                    title={`Step ${step} of 6`}
                    subtitle="Conversational Profile Onboarding"
                    onBack={step > 1 ? handleBack : handleBackToWelcome}
                    actions={
                        isDev && step > 1 && step < 6 ? (
                            <button onClick={() => setStep(6)} className="onboarding-skip-btn font-ui">
                                Skip to Review
                            </button>
                        ) : null
                    }
                />

                {showDraftBanner && (
                    <div className="draft-restored-banner font-ui">
                        <span>We've restored your progress from where you left off.</span>
                        <div className="draft-banner-actions">
                            <button type="button" onClick={handleStartFresh} className="draft-banner-link">Start over</button>
                            <button type="button" onClick={() => setShowDraftBanner(false)} className="draft-banner-dismiss" aria-label="Dismiss">
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
                </div>

                <div className="onboarding-content-wrap">
                    <form onSubmit={handleFormSubmit} onKeyDown={handleFormKeyDown} className="onboarding-step-form">
                        {step === 1 && (
                            <div className="step-content page-enter">
                                <h2 className="step-heading font-display">Let's start with<br />the basics.</h2>

                                <Input
                                    id="name"
                                    label="What should we call you?"
                                    placeholder="First Name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    error={validationErrors.name}
                                    required
                                    autoFocus
                                />

                                <div className="form-group border-top">
                                    <label className="form-label font-ui">Date of Birth</label>
                                    <div className="dob-inputs">
                                        <input
                                            type="text"
                                            pattern="[0-9]*"
                                            maxLength={2}
                                            placeholder="DD"
                                            value={formData.dobDay}
                                            onChange={(e) => handleChange('dobDay', e.target.value.replace(/\D/g, ''))}
                                            className="dob-input font-ui"
                                            aria-label="Birth day"
                                            required
                                        />
                                        <select
                                            value={formData.dobMonth}
                                            onChange={(e) => handleChange('dobMonth', e.target.value)}
                                            className="dob-month-select font-ui"
                                            aria-label="Birth month"
                                            required
                                        >
                                            <option value="">Month</option>
                                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                                                <option key={m} value={idx + 1}>{m}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            pattern="[0-9]*"
                                            maxLength={4}
                                            placeholder="YYYY"
                                            value={formData.dobYear}
                                            onChange={(e) => handleChange('dobYear', e.target.value.replace(/\D/g, ''))}
                                            className="dob-input year font-ui"
                                            aria-label="Birth year"
                                            required
                                        />
                                    </div>
                                    {validationErrors.dob ? (
                                        <span className="vh-input-error font-ui" role="alert">{validationErrors.dob}</span>
                                    ) : (
                                        <span className="form-help-text font-ui">You must be 18 or older to join.</span>
                                    )}
                                </div>

                                <Input
                                    id="city"
                                    label="Where are you based?"
                                    placeholder="City Name (e.g. Mumbai, Bangalore)"
                                    value={formData.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    error={validationErrors.city}
                                    required
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step-content page-enter">
                                <h2 className="step-heading font-display">How do you<br />identify?</h2>
                                <p className="step-description font-body">
                                    This helps us show you to the right people. You choose what's visible on your profile.
                                </p>

                                <div className="form-group">
                                    <label className="form-label font-ui">Gender</label>
                                    <div
                                        className="selection-chips"
                                        role="radiogroup"
                                        aria-label="Gender Identity"
                                        onKeyDown={handleGroupKeyDown}
                                    >
                                        {genderOptions.map((g, idx) => {
                                            const isSelected = formData.gender === g;
                                            return (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    tabIndex={isSelected ? 0 : (formData.gender === '' && idx === 0 ? 0 : -1)}
                                                    onClick={() => handleChange('gender', g)}
                                                    className={`selection-chip font-ui ${isSelected ? 'active' : ''}`}
                                                >
                                                    {g}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {formData.gender === 'Prefer to self-describe' && (
                                        <Input
                                            id="custom-gender"
                                            placeholder="Describe your gender"
                                            value={customGenderText}
                                            onChange={(e) => setCustomGenderText(e.target.value)}
                                            error={validationErrors.gender}
                                            required
                                            autoFocus
                                        />
                                    )}

                                    <label className="checkbox-label font-ui">
                                        <input
                                            type="checkbox"
                                            checked={formData.showGender}
                                            onChange={(e) => handleChange('showGender', e.target.checked)}
                                        />
                                        <span>Show gender on my profile</span>
                                    </label>
                                </div>

                                <div className="form-group border-top">
                                    <label className="form-label font-ui">Sexual Orientation</label>
                                    <div
                                        className="selection-chips"
                                        role="radiogroup"
                                        aria-label="Sexual Orientation"
                                        onKeyDown={handleGroupKeyDown}
                                    >
                                        {orientationOptions.map((o, idx) => {
                                            const isSelected = formData.orientation === o;
                                            return (
                                                <button
                                                    key={o}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    tabIndex={isSelected ? 0 : (formData.orientation === '' && idx === 0 ? 0 : -1)}
                                                    onClick={() => handleChange('orientation', o)}
                                                    className={`selection-chip font-ui ${isSelected ? 'active' : ''}`}
                                                >
                                                    {o}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {formData.orientation === 'Prefer to self-describe' && (
                                        <Input
                                            id="custom-orientation"
                                            placeholder="Describe your orientation"
                                            value={customOrientationText}
                                            onChange={(e) => setCustomOrientationText(e.target.value)}
                                            error={validationErrors.orientation}
                                            required
                                            autoFocus
                                        />
                                    )}

                                    <label className="checkbox-label font-ui">
                                        <input
                                            type="checkbox"
                                            checked={formData.showOrientation}
                                            onChange={(e) => handleChange('showOrientation', e.target.checked)}
                                        />
                                        <span>Show orientation on my profile</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="step-content page-enter">
                                <h2 className="step-heading font-display">What are you<br />looking for?</h2>
                                <p className="step-description font-body">
                                    This helps us connect you with people seeking the same intentions.
                                </p>

                                <div className="form-group">
                                    <label className="form-label font-ui">Relationship Intent</label>
                                    <div
                                        className="radio-selections"
                                        role="radiogroup"
                                        aria-label="Relationship Intent"
                                        onKeyDown={handleGroupKeyDown}
                                    >
                                        {intentionOptions.map((opt, idx) => {
                                            const isSelected = formData.relationshipIntent === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    tabIndex={isSelected ? 0 : (formData.relationshipIntent === '' && idx === 0 ? 0 : -1)}
                                                    onClick={() => handleChange('relationshipIntent', opt.value)}
                                                    className={`radio-selection-card ${isSelected ? 'active' : ''}`}
                                                >
                                                    <div className="radio-card-header font-ui">
                                                        <span className="radio-bullet" />
                                                        <strong>{opt.label}</strong>
                                                    </div>
                                                    <p className="radio-card-desc font-body">{opt.desc}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="form-group border-top">
                                    <label className="form-label font-ui">Current Relationship Status</label>
                                    <div
                                        className="selection-chips"
                                        role="radiogroup"
                                        aria-label="Current Relationship Status"
                                        onKeyDown={handleGroupKeyDown}
                                    >
                                        {statusOptions.map((s, idx) => {
                                            const isSelected = formData.relationshipStatus === s;
                                            return (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    tabIndex={isSelected ? 0 : (formData.relationshipStatus === '' && idx === 0 ? 0 : -1)}
                                                    onClick={() => handleChange('relationshipStatus', s)}
                                                    className={`selection-chip font-ui ${isSelected ? 'active' : ''}`}
                                                >
                                                    {s}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="step-content page-enter">
                                <h2 className="step-heading font-display">Tell your story.</h2>
                                <p className="step-description font-body">
                                    This is your chance to share what makes you, you. Be yourself.
                                </p>

                                <div className="form-group">
                                    <label className="form-label font-ui">Your Interests (Select at least 3)</label>
                                    <div
                                        className="selection-chips"
                                        role="group"
                                        aria-label="Your Interests"
                                        onKeyDown={handleInterestKeyDown}
                                    >
                                        {interestOptions.map((i, idx) => {
                                            const isSelected = formData.interests.includes(i);
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    tabIndex={idx === 0 ? 0 : -1}
                                                    onClick={() => handleInterestToggle(i)}
                                                    className={`selection-chip font-ui ${isSelected ? 'active-burgundy' : ''}`}
                                                >
                                                    {isSelected && <span className="selected-dot-chip" />}
                                                    {i}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {validationErrors.interests ? (
                                        <span className="vh-input-error font-ui" role="alert">{validationErrors.interests}</span>
                                    ) : (
                                        <span className="form-help-text font-ui">{formData.interests.length} selected</span>
                                    )}
                                </div>

                                <div className="form-group border-top">
                                    <Textarea
                                        id="story"
                                        label="Your Story"
                                        placeholder="Share a bit about your hobbies, values, or what a perfect weekend looks like to you..."
                                        value={formData.story}
                                        onChange={(e) => handleChange('story', e.target.value)}
                                        maxLength={500}
                                        error={validationErrors.story}
                                        helperText="Write at least 20 characters."
                                        onEnterSubmit={handleFormSubmit}
                                        required
                                    />
                                </div>

                                {/* Disability Status */}
                                <div className="form-group border-top">
                                    <div className="info-box-disability">
                                        <Info size={20} className="info-icon" />
                                        <div>
                                            <h4 className="info-box-title font-ui">Disability Status (Optional)</h4>
                                            <p className="info-box-desc font-body">
                                                We ask this to build a more inclusive space. You control if this is visible on your profile.
                                            </p>
                                        </div>
                                    </div>

                                    <label className="checkbox-label label-bold font-ui">
                                        <input
                                            type="checkbox"
                                            checked={formData.hasDisability}
                                            onChange={(e) => handleChange('hasDisability', e.target.checked)}
                                        />
                                        <span>I have a disability I want to share</span>
                                    </label>

                                    {formData.hasDisability && (
                                        <div className="disability-details-input page-enter">
                                            <Input
                                                id="disability-info"
                                                placeholder="Share details (e.g. Wheelchair user, Deaf) - optional"
                                                value={formData.disabilityInfo}
                                                onChange={(e) => handleChange('disabilityInfo', e.target.value)}
                                            />
                                            <label className="checkbox-label font-ui">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.showDisability}
                                                    onChange={(e) => handleChange('showDisability', e.target.checked)}
                                                />
                                                <span>Show disability details on my profile</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="step-content page-enter">
                                <h2 className="step-heading font-display">Show the world<br />the real you.</h2>
                                <p className="step-description font-body">
                                    Add at least 1 photo to publish your profile. You can upload up to 6.
                                </p>

                                <div className="photo-grid">
                                    {Array.from({ length: 6 }).map((_, idx) => {
                                        const preview = photoPreviews[idx];
                                        const isUploadingSlot = !preview && idx < photoPreviews.length + uploadingCount;
                                        return (
                                            <div key={idx} className={`photo-slot ${idx === 0 ? 'primary-slot' : ''}`}>
                                                {preview ? (
                                                    <div className="photo-preview-wrap">
                                                        <img src={preview} alt={`Upload preview ${idx + 1}`} />
                                                        <button type="button" onClick={() => removePhoto(idx)} className="delete-photo-btn" aria-label="Delete photo">
                                                            <X size={16} />
                                                        </button>
                                                        {idx === 0 && <span className="primary-photo-label font-ui">Primary Photo</span>}
                                                    </div>
                                                ) : isUploadingSlot ? (
                                                    <div className="photo-preview-wrap photo-uploading-slot">
                                                        <span className="upload-btn-text font-ui">Uploading…</span>
                                                    </div>
                                                ) : (
                                                    <label className={`photo-upload-label ${uploadingCount > 0 ? 'is-disabled' : ''}`}>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handlePhotoUpload}
                                                            className="sr-only"
                                                            multiple={idx === 0}
                                                            disabled={uploadingCount > 0}
                                                        />
                                                        <Camera size={24} className="camera-upload-icon" />
                                                        <span className="upload-btn-text font-ui">Add Photo</span>
                                                    </label>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {photoUploadError && (
                                    <div className="vh-input-error font-ui" role="alert" style={{ marginBottom: '16px' }}>{photoUploadError}</div>
                                )}

                                {validationErrors.photos && (
                                    <div className="vh-input-error font-ui" role="alert" style={{ marginBottom: '16px' }}>{validationErrors.photos}</div>
                                )}

                                <div className="photo-tips font-body">
                                    <h4 className="font-ui">Photo Tips:</h4>
                                    <ul>
                                        <li>&bull; Choose natural, warm photos in soft lighting</li>
                                        <li>&bull; Smile! Expressions of warmth are inviting</li>
                                        <li>&bull; Include at least one clear portrait showing your face</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="step-content page-enter">
                                <h2 className="step-heading font-display">Looking good.</h2>
                                <p className="step-description font-body">
                                    Review your editorial profile preview before going live.
                                </p>

                                {/* Profile Card Preview */}
                                <div className="preview-card-outer">
                                    <div className="profile-gallery-card">
                                        <div className="profile-img-container">
                                            <img
                                                src={photoPreviews[0] || getDefaultAvatar(formData.gender === 'Prefer to self-describe' ? customGenderText : formData.gender)}
                                                alt={formData.name || 'Preview'}
                                            />
                                            <div className="profile-badge-strip">
                                                <span className="profile-badge-new font-ui">PREVIEW</span>
                                            </div>
                                        </div>

                                        <div className="profile-card-details">
                                            <div className="profile-name-row">
                                                <h3 className="profile-name font-display">{formData.name || 'Your Name'}</h3>
                                                <span className="profile-age font-ui">
                                                    , {formData.dobYear ? new Date().getFullYear() - parseInt(formData.dobYear) : 'Age'}
                                                </span>
                                            </div>

                                            <p className="profile-location font-ui">{formData.city || 'Your City'}</p>

                                            <div className="profile-intents font-ui">
                                                <span>{formData.relationshipIntent}</span>
                                            </div>

                                            {formData.story && (
                                                <p className="profile-story-clamp font-body italic">
                                                    "{formData.story}"
                                                </p>
                                            )}

                                            {formData.interests.length > 0 && (
                                                <div className="profile-interests-wrap">
                                                    {formData.interests.slice(0, 4).map(i => (
                                                        <span key={i} className="interest-tag font-ui">{i}</span>
                                                    ))}
                                                </div>
                                            )}

                                            {formData.hasDisability && formData.showDisability && formData.disabilityInfo && (
                                                <div className="profile-disability-tag font-ui">
                                                    <span>♿ {formData.disabilityInfo}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        {submitError && (
                            <div className="error-message font-ui" role="alert" style={{ marginBottom: 'var(--space-4)', textAlign: 'center' }}>
                                {submitError}
                            </div>
                        )}
                        <div className="onboarding-actions-footer">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={submitting}
                                loading={submitting}
                                className="onboarding-continue-btn"
                            >
                                {submitting ? 'Saving...' : step === 6 ? 'Publish My Profile ✓' : 'Continue →'}
                            </Button>
                        </div>
                    </form>
                </div>

                <style>{`
        /* ── Layout ─────────────────────────────────────── */
        .onboarding-page {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-page);
          padding: var(--space-4) var(--space-4) 0;
          max-width: 640px;
          margin: 0 auto;
        }

        /* Draft restored banner */
        .draft-restored-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          background-color: var(--bg-accent-subtle, #FCEAEE);
          border: 1px solid var(--burgundy-200, #E8B8C4);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
          margin-bottom: var(--space-4);
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        .draft-banner-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-shrink: 0;
        }

        .draft-banner-link {
          color: var(--text-accent, var(--burgundy-500));
          font-weight: 600;
          text-decoration: underline;
          background: none;
          border: none;
        }

        .draft-banner-dismiss {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          background: none;
          border: none;
        }

        /* Progress bar */
        .progress-container {
          width: 100%;
          height: 4px;
          background-color: var(--charcoal-200);
          border-radius: var(--radius-full);
          margin-bottom: var(--space-6);
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--burgundy-600), var(--burgundy-400));
          border-radius: var(--radius-full);
          transition: width 0.4s var(--ease-out-smooth);
        }

        .onboarding-content-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .onboarding-step-form {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          padding-bottom: var(--space-8);
        }

        .step-heading {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          color: var(--burgundy-900);
          line-height: var(--leading-tight);
          letter-spacing: var(--tracking-tight);
        }

        [data-theme="dark"] .step-heading {
          color: var(--cream-100);
        }

        .step-description {
          font-size: var(--text-body);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin-top: calc(-1 * var(--space-3));
        }

        /* Form groups */
        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .form-group.border-top {
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-6);
        }

        .form-label {
          font-size: var(--text-body-sm);
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
        }

        .form-help-text {
          font-size: var(--text-caption);
          color: var(--text-muted);
        }

        /* DOB inputs */
        .dob-inputs {
          display: flex;
          gap: var(--space-2);
          align-items: center;
        }

        .dob-input {
          width: 64px;
          padding: var(--space-3) var(--space-2);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          background-color: var(--bg-input);
          color: var(--text-primary);
          text-align: center;
          font-size: var(--text-body);
          outline: none;
          transition: all var(--duration-fast);
        }

        .dob-input.year {
          width: 88px;
        }

        .dob-input:focus {
          border-color: var(--border-focus);
          background-color: var(--bg-surface);
          box-shadow: 0 0 0 3px var(--burgundy-100);
        }

        .dob-month-select {
          flex: 1;
          padding: var(--space-3) var(--space-3);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          background-color: var(--bg-input);
          color: var(--text-primary);
          font-size: var(--text-body);
          outline: none;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .dob-month-select:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--burgundy-100);
        }

        /* Selection chips */
        .selection-chips {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .selection-chip {
          background-color: var(--bg-surface);
          color: var(--text-secondary);
          border: 1.5px solid var(--border-default);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--text-body-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--duration-fast);
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .selection-chip:hover {
          border-color: var(--burgundy-400);
          color: var(--text-primary);
        }

        .selection-chip.active {
          background-color: var(--burgundy-50);
          border-color: var(--burgundy-400);
          color: var(--text-accent);
        }

        /* Dark mode: chip active state — keep readable contrast */
        [data-theme="dark"] .selection-chip.active {
          background-color: rgba(184, 67, 106, 0.28);
          border-color: var(--burgundy-400);
          color: var(--cream-100);
        }

        .selection-chip.active-burgundy {
          background-color: var(--burgundy-500);
          border-color: var(--burgundy-500);
          color: #FFFFFF;
        }

        .selected-dot-chip {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: currentColor;
          flex-shrink: 0;
        }

        /* Radio cards (Relationship Intent) */
        .radio-selections {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .radio-selection-card {
          width: 100%;
          background-color: var(--bg-surface);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: var(--space-4) var(--space-5);
          text-align: left;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .radio-selection-card:hover {
          border-color: var(--burgundy-300);
          background-color: var(--burgundy-50);
        }

        .radio-selection-card.active {
          border-color: var(--burgundy-500);
          background-color: var(--burgundy-50);
          box-shadow: 0 0 0 1px var(--burgundy-500);
        }

        /* Dark mode: radio card active — light card background makes text invisible */
        [data-theme="dark"] .radio-selection-card.active {
          background-color: rgba(184, 67, 106, 0.18);
          border-color: var(--burgundy-400);
          box-shadow: 0 0 0 1px var(--burgundy-400);
        }

        [data-theme="dark"] .radio-selection-card.active .radio-card-header strong {
          color: var(--cream-100);
        }

        [data-theme="dark"] .radio-selection-card.active .radio-card-desc {
          color: var(--charcoal-300, #c0bfbe);
        }

        /* Dark mode: same fix as .active above, but for :hover — the light
           burgundy-50 hover background was invisible against dark-mode's
           light default text color. */
        [data-theme="dark"] .radio-selection-card:hover {
          border-color: var(--burgundy-400);
          background-color: rgba(184, 67, 106, 0.12);
        }

        [data-theme="dark"] .radio-selection-card:hover .radio-card-header strong {
          color: var(--cream-100);
        }

        [data-theme="dark"] .radio-selection-card:hover .radio-card-desc {
          color: var(--charcoal-300, #c0bfbe);
        }

        .radio-card-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-1);
        }

        .radio-bullet {
          width: 14px;
          height: 14px;
          border: 2px solid var(--border-default);
          border-radius: 50%;
          flex-shrink: 0;
          transition: all var(--duration-fast);
        }

        .radio-selection-card.active .radio-bullet {
          border-color: var(--burgundy-500);
          background-color: var(--burgundy-500);
          box-shadow: 0 0 0 2px var(--burgundy-100) inset;
        }

        .radio-card-desc {
          font-size: var(--text-body-sm);
          color: var(--text-muted);
          padding-left: calc(14px + var(--space-3));
        }

        /* Photo Grid (Step 5) */
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .photo-slot {
          aspect-ratio: 3/4;
          border: 2px dashed var(--border-default);
          border-radius: var(--radius-md);
          background-color: var(--bg-surface-warm);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          transition: border-color var(--duration-fast);
        }

        .photo-slot.primary-slot {
          border-color: var(--burgundy-300);
          background-color: var(--burgundy-50);
        }

        .photo-slot:hover {
          border-color: var(--burgundy-400);
        }

        .photo-preview-wrap {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .photo-preview-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .delete-photo-btn {
          position: absolute;
          top: var(--space-1);
          right: var(--space-1);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: rgba(196, 90, 90, 0.9);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          transition: background-color var(--duration-fast);
        }

        .delete-photo-btn:hover {
          background-color: var(--error);
        }

        .primary-photo-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(184, 67, 106, 0.9);
          color: #FFFFFF;
          font-size: 9px;
          text-align: center;
          padding: 3px 0;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .photo-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-1);
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .photo-upload-label.is-disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .photo-uploading-slot {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-surface-warm);
        }

        .photo-uploading-slot .upload-btn-text {
          color: var(--text-muted);
          animation: pulse 1.4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .camera-upload-icon {
          color: var(--charcoal-400);
        }

        .upload-btn-text {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Photo tips */
        .photo-tips {
          background-color: var(--bg-surface-warm);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: var(--space-4) var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .photo-tips h4 {
          font-size: var(--text-body-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .photo-tips ul {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .photo-tips li {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: var(--leading-normal);
        }

        /* Checkbox */
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          cursor: pointer;
        }

        .checkbox-label.label-bold span {
          font-weight: 600;
          color: var(--text-primary);
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--burgundy-500);
          flex-shrink: 0;
        }

        /* Disability section */
        .info-box-disability {
          display: flex;
          gap: var(--space-3);
          background-color: var(--info-light);
          border: 1px solid rgba(90, 138, 196, 0.2);
          border-radius: var(--radius-md);
          padding: var(--space-4);
        }

        .info-icon {
          color: var(--info);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-box-title {
          font-size: var(--text-body-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .info-box-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: var(--leading-normal);
        }

        .disability-details-input {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding-left: var(--space-6);
          margin-top: var(--space-2);
        }

        /* Step 6 – Review Preview Card */
        .preview-card-outer {
          display: flex;
          justify-content: center;
          padding: var(--space-4) 0;
        }

        .profile-gallery-card {
          width: 100%;
          max-width: 320px;
          background-color: var(--bg-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }

        .profile-img-container {
          aspect-ratio: 3/4;
          position: relative;
          background-color: var(--charcoal-200);
          overflow: hidden;
        }

        .profile-img-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-badge-strip {
          position: absolute;
          top: var(--space-3);
          left: var(--space-3);
        }

        .profile-badge-new {
          background: rgba(184, 67, 106, 0.9);
          color: #FFFFFF;
          font-size: 9px;
          font-weight: bold;
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .profile-card-details {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .profile-name-row {
          display: flex;
          align-items: baseline;
          gap: 2px;
        }

        .profile-name {
          font-size: var(--text-subheading);
          color: var(--text-primary);
        }

        .profile-age {
          font-size: var(--text-body);
          color: var(--text-secondary);
        }

        .profile-location {
          font-size: var(--text-body-sm);
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .profile-intents {
          font-size: var(--text-body-sm);
          color: var(--text-accent);
          font-weight: 600;
        }

        .profile-story-clamp {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          border-left: 2px solid var(--burgundy-200);
          padding-left: var(--space-3);
        }

        .profile-interests-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
        }

        .interest-tag {
          font-size: var(--text-caption);
          color: var(--burgundy-600);
          background-color: var(--burgundy-50);
          padding: 2px var(--space-2);
          border-radius: var(--radius-full);
          font-weight: 500;
        }

        .profile-disability-tag {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-caption);
          color: var(--success);
          background-color: var(--success-light);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-weight: 500;
        }

        /* Footer CTA */
        .onboarding-actions-footer {
          position: sticky;
          bottom: 0;
          background-color: var(--bg-page);
          padding: var(--space-4) 0 var(--space-6);
          border-top: 1px solid var(--border-subtle);
          margin-top: auto;
        }

        .onboarding-continue-btn {
          width: 100% !important;
          padding: var(--space-4) var(--space-6) !important;
          font-size: var(--text-body) !important;
        }

        .onboarding-skip-btn {
          font-size: var(--text-body-sm);
          color: var(--text-muted);
          text-decoration: underline;
          background: none;
          border: none;
          cursor: pointer;
          transition: color var(--duration-fast);
        }

        .onboarding-skip-btn:hover {
          color: var(--text-secondary);
        }

        @media (max-width: 480px) {
          .photo-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .dob-input { width: 52px; }
          .dob-input.year { width: 74px; }
        }
      `}</style>
            </div>
        );
    };