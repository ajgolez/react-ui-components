// iconMap.ts
import { faUser, faCamera } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const iconMap: Record<string, IconDefinition> = {
    user: faUser,
    camera: faCamera,
    // Add more icons as needed
};

export const getIcon = (name: string): IconDefinition | undefined => {
    return iconMap[name];
};
