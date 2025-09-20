import React from 'react';
import MainNavigation from './MainNavigation';

export interface NavigationItem {
  label: string;
  path: string;
}

export interface HeaderProps {
  logo?: string;
  navigationItems?: NavigationItem[];
  className?: string;
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <MainNavigation />
  );
};

export default Header;
