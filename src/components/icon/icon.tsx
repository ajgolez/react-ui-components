import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getIcon } from './iconMap';

interface IconProps {
    iconName: string;
    size?: 'xs' | 'lg' | 'sm';
    className?: string;
}

export const Icon = ({ iconName, size, className }: IconProps) => {
    const icon = getIcon(iconName);


    return icon ? <FontAwesomeIcon icon={icon} size={size} className={className} /> : null;

    // <i className={`fa-${props.name} ${props.className}`} {...props}></i>;
    // return (<>
    //     <i className={`fa-${props.name} ${props.className}`} {...props}></i>;
    //     <FontAwesomeIcon icon={faUser} className={props.name} size="lg" />
    // </>
    //)
};
