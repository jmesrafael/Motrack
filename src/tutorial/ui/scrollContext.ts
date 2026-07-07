import { createContext } from 'react';

/**
 * Carries the enclosing Screen's registered scroll-container id down to
 * anchors so auto-scroll knows which ScrollView to drive.
 */
export const TutorialScrollContext = createContext<string | undefined>(undefined);
