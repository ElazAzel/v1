import React, { useState, useEffect, useRef } from 'react';
import { Block, BlockType, LinkBlock, ShopBlock, Product, ChatbotProfile, UserRole, SearchBlock, SeoConfig, Profile, SocialsBlock, SocialPlatform, SocialLink, TextBlock, ImageBlock, VideoBlock, ButtonBlock, ImageCarouselBlock, CarouselImage, BaseBlock } from '../types';
import { TrashIcon, LinkIcon, ShoppingCartIcon, WandSparklesIcon, BotIcon, LockIcon, SearchIcon, BarChartIcon, ChevronDownIcon, GripVerticalIcon, TagsIcon, SettingsIcon, PlusIcon, GlobeIcon, TwitterIcon, InstagramIcon, GithubIcon, TelegramIcon, LinkedinIcon, TypeIcon, ImageIcon, VideoIcon, MousePointerClickIcon, GalleryHorizontalIcon, UploadCloudIcon, DownloadCloudIcon, Share2Icon, GiftIcon, FacebookIcon, TiktokIcon, YoutubeIcon, ThreadsIcon, EyeIcon } from './Icons';
import * as geminiService from '../services/geminiService';
import { compressToBase64 } from '../utils/compression';

const URL_REGEX = new RegExp(
  '^(https?:\\/\\/)?' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
  '(\\#[-a-z\\d_]*)?$', // fragment locator
  'i'
);

const generateTitleFromUrl = (urlString: string): string => {
    try {
        if (!/^https?:\/\//i.test(urlString)) {
            urlString = 'https://' + urlString;
        }
        const url = new URL(urlString);
        const path = url.pathname.split('/').filter(Boolean).pop();
        if (path && path.length > 1) {
            return path.replace(/[_-]/g, ' ').replace(/\.html$|\.php$|\/$/, '').replace(/\b\w/g, l => l.toUpperCase());
        }
        const hostname = url.hostname.replace(/^www\./, '');
        const domain = hostname.split('.')[0];
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch (error) {
        return '';
    }
};

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex justify-center items-center gap-2 p-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
      isActive
        ? 'border-indigo-500 text-white'
        : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50'
    }`}
  >
    {icon}
    {label}
  </button>
);

const animatedAvatarFrames = [
    { id: 'chroma-spin', name: 'Chroma' },
    { id: 'aura-pulse', name: 'Aura' },
    { id: 'glitch-tech', name: 'Glitch' },
];

const RenderAvatarFrame: React.FC<{ frameId: string }> = ({ frameId }) => {
    const frameProps = {
        className: "absolute inset-0 w-full h-full pointer-events-none",
        'aria-hidden': true
    };

    if (frameId.startsWith('#')) {
        return (
            <div 
                {...frameProps} 
                className="absolute inset-0 rounded-full border-4 shadow-lg"
                style={{ borderColor: frameId }}
            ></div>
        );
    }

    switch (frameId) {
        case 'chroma-spin':
            return (
                <div {...frameProps} style={{ animation: 'rotate-gradient 8s linear infinite' }}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="48" stroke="url(#chroma-gradient-editor)" strokeWidth="4" />
                        <defs>
                            {React.createElement('conicGradient', { id: 'chroma-gradient-editor', from: '0deg', at: '50% 50%' },
                                <React.Fragment key="stops">
                                    <stop offset="0%" stopColor="#818cf8"/>
                                    <stop offset="25%" stopColor="#a78bfa"/>
                                    <stop offset="50%" stopColor="#f472b6"/>
                                    <stop offset="75%" stopColor="#fbbf24"/>
                                    <stop offset="100%" stopColor="#818cf8"/>
                                </React.Fragment>
                            )}
                        </defs>
                    </svg>
                </div>
            );
        case 'aura-pulse':
            return (
                <svg {...frameProps} width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="47" stroke="#a78bfa" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }} />
                </svg>
            );
        case 'glitch-tech':
            return (
                <div {...frameProps}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="48" stroke="#00ffff" strokeWidth="2" style={{ animation: 'glitch-anim-1 2s linear infinite' }} />
                        <circle cx="50" cy="50" r="48" stroke="#ff00ff" strokeWidth="2" style={{ animation: 'glitch-anim-2 3s linear infinite' }}/>
                        <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="1" />
                    </svg>
                </div>
            );
        default:
            return null;
    }
};

interface ProfileEditorProps {
    profile: Profile;
    setProfile: (profile: Profile | ((prev: Profile) => Profile)) => void;
    isPremium: boolean;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, setProfile, isPremium }) => {
    const handleProfileChange = <K extends keyof Profile>(key: K, value: Profile[K]) => {
        setProfile(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4">
            <h3 className="text-lg font-semibold text-white">Профиль</h3>
            <div className="space-y-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <label className="block text-sm font-medium text-gray-300">URL аватара</label>
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${isPremium ? 'bg-indigo-500/30 text-indigo-300' : 'bg-gray-700 text-gray-400'}`}>
                            {!isPremium && <LockIcon className="w-3 h-3 text-yellow-400" />}
                            GIF
                        </span>
                    </div>
                    <input
                        type="text"
                        value={profile.avatarUrl}
                        onChange={(e) => handleProfileChange('avatarUrl', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                     {!isPremium && <p className="text-xs text-yellow-400/80 mt-1.5">Загрузка GIF-аватаров доступна на премиум-тарифе.</p>}
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium text-gray-300">Рамка аватара</label>
                         {!isPremium && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-700 text-gray-400">
                                <LockIcon className="w-3 h-3 text-yellow-400" />
                                Премиум
                            </span>
                        )}
                    </div>
                    <div className={`grid grid-cols-4 sm:grid-cols-5 gap-3 ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <button
                            onClick={() => isPremium && handleProfileChange('avatarFrameId', '')}
                            disabled={!isPremium}
                            className={`aspect-square rounded-full border-2 flex items-center justify-center transition-colors relative overflow-hidden ${!profile.avatarFrameId ? 'border-indigo-500 bg-indigo-500/20' : 'border-gray-600 hover:border-gray-400'}`}
                            title="Без рамки"
                        >
                            <div className="w-4/5 h-4/5 rounded-full bg-gray-500" />
                            <div className="absolute w-0.5 h-full bg-red-500/90 transform rotate-45" />
                        </button>
                        {animatedAvatarFrames.map(frame => (
                            <button
                                key={frame.id}
                                onClick={() => isPremium && handleProfileChange('avatarFrameId', frame.id)}
                                disabled={!isPremium}
                                title={frame.name}
                                className={`relative aspect-square rounded-full border-2 transition-colors ${profile.avatarFrameId === frame.id ? 'border-indigo-500' : 'border-transparent hover:border-gray-400'}`}
                            >
                                <img src={profile.avatarUrl} alt="avatar preview" className="w-full h-full object-cover rounded-full" />
                                <RenderAvatarFrame frameId={frame.id} />
                            </button>
                        ))}
                         <div
                            title="Однотонная рамка"
                            className={`relative aspect-square rounded-full border-2 transition-colors flex items-center justify-center ${typeof profile.avatarFrameId === 'string' && profile.avatarFrameId.startsWith('#') ? 'border-indigo-500' : 'border-transparent hover:border-gray-400'}`}
                        >
                            <img src={profile.avatarUrl} alt="avatar preview" className="w-full h-full object-cover rounded-full" />
                            {typeof profile.avatarFrameId === 'string' && profile.avatarFrameId.startsWith('#') && (
                                <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: profile.avatarFrameId }}></div>
                            )}
                             <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" style={{ clipPath: 'circle(50%)' }}></div>
                            <input
                                type="color"
                                disabled={!isPremium}
                                value={typeof profile.avatarFrameId === 'string' && profile.avatarFrameId.startsWith('#') ? profile.avatarFrameId : '#ffffff'}
                                onChange={(e) => isPremium && handleProfileChange('avatarFrameId', e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                    {!isPremium && <p className="text-xs text-yellow-400/80 mt-1.5">Анимированные и цветные рамки доступны на премиум-тарифе.</p>}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Имя пользователя</label>
                    <input
                        type="text"
                        value={profile.username}
                        onChange={(e) => handleProfileChange('username', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Описание</label>
                    <textarea
                        value={profile.bio}
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white h-20 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Ваш уникальный URL</label>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white overflow-hidden">
                        <span className="text-gray-400">linkmax.bio/</span>
                        <span className="font-semibold truncate">{profile.handle}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SocialIcon: React.FC<{ platform: SocialPlatform }> = ({ platform }) => {
    const className = "w-5 h-5 text-gray-400";
    switch (platform) {
        case SocialPlatform.TWITTER: return <TwitterIcon className={className} />;
        case SocialPlatform.INSTAGRAM: return <InstagramIcon className={className} />;
        case SocialPlatform.GITHUB: return <GithubIcon className={className} />;
        case SocialPlatform.TELEGRAM: return <TelegramIcon className={className} />;
        case SocialPlatform.LINKEDIN: return <LinkedinIcon className={className} />;
        case SocialPlatform.FACEBOOK: return <FacebookIcon className={className} />;
        case SocialPlatform.TIKTOK: return <TiktokIcon className={className} />;
        case SocialPlatform.YOUTUBE: return <YoutubeIcon className={className} />;
        case SocialPlatform.THREADS: return <ThreadsIcon className={className} />;
        default: return <GlobeIcon className={className} />;
    }
};

const styleTemplates: Record<string, { name: string; customCss: string; customStyles: string }[]> = {
    [BlockType.LINK]: [
        { name: 'Стандарт', customCss: '', customStyles: '' },
        { name: 'Неоновое свечение', customCss: 'shadow-lg shadow-indigo-500/50', customStyles: 'border: 1px solid #818cf8;' },
        { name: 'Прозрачная кнопка', customCss: 'bg-transparent hover:bg-white/10', customStyles: 'border: 2px solid white;' },
        { name: '3D кнопка', customCss: 'border-b-4 border-gray-500 active:border-b-2', customStyles: 'transform: translateY(-2px);' },
    ],
    [BlockType.BUTTON]: [
        { name: 'Стандарт', customCss: '', customStyles: '' },
        { name: 'Неоновое свечение', customCss: 'shadow-lg shadow-indigo-500/50', customStyles: 'border: 1px solid #818cf8;' },
        { name: 'Прозрачная кнопка', customCss: 'bg-transparent hover:bg-white/10', customStyles: 'border: 2px solid white;' },
        { name: '3D кнопка', customCss: 'border-b-4 border-gray-500 active:border-b-2', customStyles: 'transform: translateY(-2px);' },
    ],
    [BlockType.TEXT]: [
        { name: 'Стандарт', customCss: '', customStyles: '' },
        { name: 'Цитата', customCss: 'border-l-4 border-indigo-500 pl-4 italic text-gray-300', customStyles: '' },
        { name: 'Выделенный блок', customCss: 'bg-yellow-400/20', customStyles: 'padding: 1rem; border-radius: 0.5rem;' },
    ],
    [BlockType.IMAGE]: [
        { name: 'Стандарт', customCss: '', customStyles: '' },
        { name: 'Эффект Polaroid', customCss: 'bg-white p-2 pb-4 shadow-lg', customStyles: 'transform: rotate(-2deg);' },
        { name: 'Мягкая виньетка', customCss: 'shadow-[inset_0_0_3rem_1rem_rgba(0,0,0,0.5)]', customStyles: '' },
        { name: 'Круглая маска', customCss: 'rounded-full aspect-square object-cover', customStyles: 'width: 100%;' },
    ],
    [BlockType.IMAGE_CAROUSEL]: [
        { name: 'Стандарт', customCss: '', customStyles: '' },
        { name: 'Эффект Polaroid', customCss: 'bg-white p-2 pb-4 shadow-lg', customStyles: 'transform: rotate(-2deg);' },
        { name: 'Мягкая виньетка', customCss: 'shadow-[inset_0_0_3rem_1rem_rgba(0,0,0,0.5)]', customStyles: '' },
    ],
    [BlockType.VIDEO]: [
        { name: 'Стандарт', customCss: '', customStyles: '' },
        { name: 'Закругленный с тенью', customCss: 'rounded-xl shadow-2xl shadow-black/50', customStyles: '' },
    ],
    [BlockType.SHOP]: [
        { name: 'Стандарт', customCss: '', customStyles: '' },
        { name: 'Плавающая карточка', customCss: 'shadow-2xl shadow-black/50', customStyles: 'border-radius: 1rem;' },
        { name: 'Минимализм', customCss: 'bg-transparent border-none', customStyles: '' },
    ],
    [BlockType.SEARCH]: [
        { name: 'Стандарт', customCss: '', customStyles: '' },
        { name: 'Плавающая карточка', customCss: 'shadow-2xl shadow-black/50', customStyles: 'border-radius: 1rem;' },
    ],
    [BlockType.SOCIALS]: [
        { name: 'Стандарт', customCss: '', customStyles: '' },
        { name: 'Плавающая карточка', customCss: 'bg-gray-900/50 p-3 rounded-xl shadow-2xl shadow-black/50', customStyles: '' },
    ],
};

interface BlockStyleEditorProps {
  block: BaseBlock;
  updateBlock: (id: string, updates: Partial<BaseBlock>) => void;
}

const BlockStyleEditor: React.FC<BlockStyleEditorProps> = ({ block, updateBlock }) => {
  const [isOpen, setIsOpen] = useState(false);
  const availableTemplates = styleTemplates[block.type as keyof typeof styleTemplates] || [];

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateName = e.target.value;
    const selectedTemplate = availableTemplates.find(t => t.name === templateName);
    if (selectedTemplate) {
      updateBlock(block.id, {
        customCss: selectedTemplate.customCss,
        customStyles: selectedTemplate.customStyles,
      });
    }
  };
  
  return (
    <div className="mt-4 pt-3 border-t border-gray-700/50">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-sm font-semibold text-gray-300 hover:text-white">
        <span>Стилизация</span>
        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="mt-3 space-y-4">
          {availableTemplates.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Шаблоны стилей</label>
              <select
                onChange={handleTemplateChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Выберите шаблон...</option>
                {availableTemplates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Пользовательские CSS классы</label>
            <input
              type="text"
              placeholder="e.g., animate-bounce my-class"
              value={block.customCss || ''}
              onChange={(e) => updateBlock(block.id, { customCss: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Пользовательские инлайн-стили</label>
            <textarea
              placeholder="e.g., border: 1px solid red;"
              value={block.customStyles || ''}
              onChange={(e) => updateBlock(block.id, { customStyles: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm h-20 resize-none font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};


interface SocialsBlockEditorProps {
  block: SocialsBlock;
  updateBlock: (id: string, updates: Partial<SocialsBlock>) => void;
}

const SocialsBlockEditor: React.FC<SocialsBlockEditorProps> = ({ block, updateBlock }) => {
    const [newLinkPlatform, setNewLinkPlatform] = useState<SocialPlatform>(SocialPlatform.INSTAGRAM);
    const [newLinkUrl, setNewLinkUrl] = useState('');

    const handleLinkChange = (linkId: string, url: string) => {
        const updatedLinks = block.links.map(l => l.id === linkId ? { ...l, url } : l);
        updateBlock(block.id, { links: updatedLinks });
    };

    const addLink = () => {
        if (!newLinkUrl.trim()) return;
        const newLink: SocialLink = {
            id: Date.now().toString(),
            platform: newLinkPlatform,
            url: newLinkUrl,
        };
        updateBlock(block.id, { links: [...block.links, newLink] });
        setNewLinkUrl('');
    };
    
    const removeLink = (linkId: string) => {
        updateBlock(block.id, { links: block.links.filter(l => l.id !== linkId) });
    };

    return (
        <div>
            <div className="space-y-3">
                {block.links.map(link => (
                    <div key={link.id} className="flex items-center gap-2">
                        <SocialIcon platform={link.platform} />
                        <input
                            type="text"
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => handleLinkChange(link.id, e.target.value)}
                            className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button onClick={() => removeLink(link.id)} className="p-1 text-gray-400 hover:text-red-500">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
                    <select 
                        value={newLinkPlatform}
                        onChange={(e) => setNewLinkPlatform(e.target.value as SocialPlatform)}
                        className="bg-gray-700 border border-gray-600 rounded-md px-2 py-2 text-white capitalize"
                    >
                        {Object.values(SocialPlatform).map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="URL"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button onClick={addLink} className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <BlockStyleEditor block={block} updateBlock={updateBlock} />
        </div>
    );
};


interface LinkBlockEditorProps {
  block: LinkBlock;
  updateBlock: (id: string, updates: Partial<LinkBlock>) => void;
}

const LinkBlockEditor: React.FC<LinkBlockEditorProps> = ({ block, updateBlock }) => {
  const [suggestions, setSuggestions