/**
 * Velvet Hearts Dynamic Metadata Manager
 * Dynamically updates document title, description, Open Graph, Twitter Cards,
 * canonical link, and robots indexation directives for SEO and Social Sharing.
 */

const BASE_TITLE = 'Velvet Hearts';
const DEFAULT_DESC =
  'Velvet Hearts is the official intentional dating platform featuring 16-zone biometric face verification, 2-minute voice intros, interactive couple diaries, and real-time vibe matching across India.';
const DEFAULT_IMAGE = 'https://www.velvethearts.in/velvet-heart-logo.png';
const CANONICAL_BASE = 'https://www.velvethearts.in';

const setMetaTag = (selector, attribute, value) => {
  if (!value) return;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    if (selector.startsWith('meta[name=')) {
      const name = selector.match(/meta\[name=['"]([^'"]+)['"]\]/)?.[1];
      if (name) element.setAttribute('name', name);
    } else if (selector.startsWith('meta[property=')) {
      const prop = selector.match(/meta\[property=['"]([^'"]+)['"]\]/)?.[1];
      if (prop) element.setAttribute('property', prop);
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
};

const setCanonical = (url) => {
  let link = document.querySelector("link[rel='canonical']");
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
};

export const updateMetadata = ({
  title,
  description = DEFAULT_DESC,
  robots = 'index, follow, max-image-preview:large',
  canonicalPath = '',
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
} = {}) => {
  // 1. Document Title
  const fullTitle = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Intentional Dating & Verified Profiles`;
  document.title = fullTitle;

  // 2. Primary Meta Tags
  setMetaTag("meta[name='description']", 'content', description);
  setMetaTag("meta[name='robots']", 'content', robots);

  // 3. Open Graph Tags
  setMetaTag("meta[property='og:title']", 'content', fullTitle);
  setMetaTag("meta[property='og:description']", 'content', description);
  setMetaTag("meta[property='og:type']", 'content', ogType);
  setMetaTag("meta[property='og:image']", 'content', ogImage);
  setMetaTag("meta[property='og:image:secure_url']", 'content', ogImage);

  // 4. Twitter Card Tags
  setMetaTag("meta[name='twitter:title']", 'content', fullTitle);
  setMetaTag("meta[name='twitter:description']", 'content', description);
  setMetaTag("meta[name='twitter:image']", 'content', ogImage);

  // 5. Canonical URL
  const canonicalUrl = `${CANONICAL_BASE}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
  setCanonical(canonicalUrl);
  setMetaTag("meta[property='og:url']", 'content', canonicalUrl);
  setMetaTag("meta[name='twitter:url']", 'content', canonicalUrl);
};
