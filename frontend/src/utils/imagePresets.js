export const IMAGE_PRESET_GROUPS = [
  {
    id: 'social-media',
    label: 'Social media',
    presets: [
      { id: 'instagram-square', slug: 'instagram-profile-resizer', label: 'Instagram Square', width: 1080, height: 1080 },
      { id: 'instagram-story', label: 'Instagram Story', width: 1080, height: 1920 },
      { id: 'youtube-thumbnail', slug: 'youtube-thumbnail-resizer', label: 'YouTube Thumbnail', width: 1280, height: 720 },
      { id: 'x-twitter-header', slug: 'twitter-header-resizer', label: 'X/Twitter Header', width: 1500, height: 500 },
      { id: 'discord-pfp', slug: 'discord-pfp-resizer', label: 'Discord Profile Picture', width: 512, height: 512 },
    ],
  },
  {
    id: 'developer',
    label: 'Developer',
    presets: [
      { id: 'github-readme-image', label: 'GitHub README Image', width: 1200, height: 630 },
      { id: 'velog-thumbnail', label: 'Velog Thumbnail', width: 1200, height: 630 },
    ],
  },
  {
    id: 'game-creator',
    label: 'Game/Creator',
    presets: [
      { id: 'steam-capsule-small', label: 'Steam Capsule Small', width: 231, height: 87 },
      { id: 'steam-capsule-header', label: 'Steam Capsule Header', width: 460, height: 215 },
    ],
  },
];

export function findPresetById(presetId) {
  for (const group of IMAGE_PRESET_GROUPS) {
    const preset = group.presets.find((item) => item.id === presetId);
    if (preset) {
      return preset;
    }
  }

  return null;
}

