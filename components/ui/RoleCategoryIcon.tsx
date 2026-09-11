import React from 'react';
import { BarChart3, Briefcase, Code, Handshake, Megaphone, Palette, Wallet } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Engineering: Code,
  Product: Briefcase,
  Data: BarChart3,
  Design: Palette,
  Marketing: Megaphone,
  Sales: Handshake,
  Finance: Wallet,
};

interface RoleCategoryIconProps {
  category: string;
  size?: number;
  className?: string;
}

export default function RoleCategoryIcon({
  category,
  size = 18,
  className,
}: RoleCategoryIconProps) {
  const Icon = CATEGORY_ICONS[category] ?? Briefcase;
  return <Icon size={size} className={className} aria-hidden />;
}
