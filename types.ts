

export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin',
}

export enum BlockType {
  SOCIALS = 'socials',
  LINK = 'link',
  SHOP = 'shop',
  SEARCH = 'search',
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  BUTTON = 'button',
  IMAGE_CAROUSEL = 'image_carousel',
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  customCss?: string;
  customStyles?: string;
}

export enum SocialPlatform {
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  GITHUB = 'github',
  TELEGRAM = 'telegram',
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
  THREADS = 'threads',
}

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
}

export interface SocialsBlock extends BaseBlock {
  type: BlockType.SOCIALS;
  links: SocialLink[];
}

export interface LinkBlock extends BaseBlock {
  type: BlockType.LINK;
  title: string;
  url: string;
  clicks: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

export interface ShopBlock extends BaseBlock {
  type: BlockType.SHOP;
  title: string;
  products: Product[];
}

export interface SearchBlock extends BaseBlock {
    type: BlockType.SEARCH;
    title: string;
}

export interface TextBlock extends BaseBlock {
  type: BlockType.TEXT;
  content: string;
}

export interface ImageBlock extends BaseBlock {
  type: BlockType.IMAGE;
  url: string;
  caption: string;
}

export interface VideoBlock extends BaseBlock {
  type: BlockType.VIDEO;
  url: string;
}

export interface ButtonBlock extends BaseBlock {
  type: BlockType.BUTTON;
  text: string;
  url: string;
  clicks: number;
  style: {
    type: 'fill' | 'image' | 'gradient';
    backgroundColor?: string;
    textColor?: string;
    imageUrl?: string;
    gradientStartColor?: string;
    gradientEndColor?: string;
    gradientAngle?: number;
    hover?: {
      shadow?: 'none' | 'sm' | 'md' | 'lg' | 'glow';
      glowColor?: string;
      scale?: 'none' | 'sm' | 'md';
      backgroundColor?: string;
    };
  };
}

export interface CarouselImage {
    id: string;
    url: string;
}

export interface ImageCarouselBlock extends BaseBlock {
    type: BlockType.IMAGE_CAROUSEL;
    images: CarouselImage[];
}

export type Block = SocialsBlock | LinkBlock | ShopBlock | SearchBlock | TextBlock | ImageBlock | VideoBlock | ButtonBlock | ImageCarouselBlock;

export interface Profile {
  avatarUrl: string;
  username: string;
  bio: string;
  handle: string;
  avatarFrameId?: string;
}

export interface ChatbotProfile {
  type: 'person' | 'company' | null;
  name: string;
  details: string;
  additionalInfo: string;
}

export interface SeoConfig {
  title: string;
  description: string;
  keywords: string[];
}