// `presetId` opens the resizer with that preset pre-applied; `page` opens a
// different tool tab instead. Every entry becomes its own static HTML entry
// point at build time (see vite.config.js).
export const SEO_LANDING_PAGES = [
  {
    slug: 'background-remover',
    page: 'background',
    title: 'AI Background Remover – Remove Image Backgrounds Free | Creator Image Resizer',
    description:
      'Remove the background from any image free with AI that runs in your browser. No upload, no signup, no watermark — download a transparent PNG.',
    h1: 'AI Background Remover',
    intro:
      'Upload an image and an AI model running inside your browser cuts the subject out and gives you a transparent PNG. Because the model runs locally, your image is never uploaded to a server.',
  },
  {
    slug: 'youtube-thumbnail-resizer',
    presetId: 'youtube-thumbnail',
    title: 'YouTube Thumbnail Resizer – Resize to 1280x720 Free | Creator Image Resizer',
    description:
      'Resize any image to the exact YouTube thumbnail size (1280x720) free in your browser. No upload, no signup – export PNG, JPEG, or WebP instantly.',
    h1: 'YouTube Thumbnail Resizer (1280x720)',
    intro:
      'Upload an image and it is automatically resized to YouTube’s recommended thumbnail size of 1280x720 pixels. Processing happens locally in your browser, so your image is never uploaded to a server.',
  },
  {
    slug: 'instagram-profile-resizer',
    presetId: 'instagram-square',
    title: 'Instagram Profile & Post Photo Resizer – 1080x1080 Free | Creator Image Resizer',
    description:
      'Resize your Instagram profile picture or square post to 1080x1080 free, right in your browser. No upload, no signup, no watermark.',
    h1: 'Instagram Profile Picture Resizer (1080x1080)',
    intro:
      'Upload a photo and it is automatically resized to Instagram’s recommended square size of 1080x1080 pixels for profile pictures and feed posts. Everything runs locally in your browser.',
  },
  {
    slug: 'twitter-header-resizer',
    presetId: 'x-twitter-header',
    title: 'X (Twitter) Header Banner Resizer – 1500x500 Free | Creator Image Resizer',
    description:
      'Resize a header/banner image to the exact X (Twitter) profile banner size (1500x500) free in your browser. No upload, no signup.',
    h1: 'X / Twitter Header Resizer (1500x500)',
    intro:
      'Upload an image and it is automatically resized to X’s recommended profile header size of 1500x500 pixels. Processing happens locally, so your image is never sent to a server.',
  },
  {
    slug: 'discord-pfp-resizer',
    presetId: 'discord-pfp',
    title: 'Discord Profile Picture Resizer – 512x512 Free | Creator Image Resizer',
    description:
      'Resize your Discord avatar/profile picture to a crisp 512x512 free in your browser. No upload, no signup, avoids the blur from tiny source images.',
    h1: 'Discord Profile Picture Resizer (512x512)',
    intro:
      'Upload an image and it is automatically resized to 512x512 pixels, a size that stays sharp for Discord’s avatar display. Processing happens locally in your browser.',
  },
];

export function findSeoLandingPageBySlug(slug) {
  return SEO_LANDING_PAGES.find((page) => page.slug === slug) ?? null;
}
