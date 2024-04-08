/**
 * Drupal settings JSON with property to decipher content categories for service and unit
 */
export type DrupalSettingsJson = {
  path?: {
    currentPath?: string | null;
    currentLanguage?: string | null;
  };
};
