import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
  className?: string;
}

export function Link({ href, children, mobile, className = '' }: LinkProps) {
  const baseStyles = "text-gray-300 hover:text-orange-500 transition-colors duration-200";
  const mobileStyles = "block px-3 py-2 text-base font-medium";
  const desktopStyles = "text-sm font-medium";
  
  return (
    <RouterLink
      to={href}
      className={`${baseStyles} ${mobile ? mobileStyles : desktopStyles} ${className}`}
    >
      {children}
    </RouterLink>
  );
}