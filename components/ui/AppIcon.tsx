import React from 'react';
import {
  ArrowLeftIcon,
  HomeIcon,
  // Add any other icons used in the project
} from 'lucide-react';

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  ArrowLeftIcon: (props) => <ArrowLeftIcon {...props} />,
  HomeIcon: (props) => <HomeIcon {...props} />,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 16, className }: IconProps) {
  const LucideIcon = iconMap[name];
  if (!LucideIcon) {
    return <span className={`inline-block w-${size} h-${size} ${className || ''}`} />;
  }
  return <LucideIcon size={size} className={className} />;
}
