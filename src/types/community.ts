import { LucideIcon } from "lucide-react";

export interface CommunityCardData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  route?: string;
}

export interface CommunitySectionData {
  title: string;
  subtitle?: string;
}