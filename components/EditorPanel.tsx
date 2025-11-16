import React, { useState, useEffect, useRef } from 'react';
import { Block, BlockType, LinkBlock, ShopBlock, Product, ChatbotProfile, UserRole, SearchBlock, SeoConfig, Profile, SocialsBlock, SocialPlatform, SocialLink, TextBlock, ImageBlock, VideoBlock, ButtonBlock, ImageCarouselBlock, CarouselImage } from '../types';
import { TrashIcon, LinkIcon, ShoppingCartIcon, WandSparklesIcon, BotIcon, LockIcon, SearchIcon, BarChartIcon, ChevronDownIcon, GripVerticalIcon, TagsIcon, SettingsIcon, PlusIcon, GlobeIcon, TwitterIcon, InstagramIcon, GithubIcon, TelegramIcon, LinkedinIcon, TypeIcon, ImageIcon, VideoIcon, MousePointerClickIcon, GalleryHorizontalIcon, UploadCloudIcon, DownloadCloudIcon, Share2Icon } from './Icons';
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

interface ProfileEditorProps {
    profile: Profile;
    setProfile: (profile: Profile | ((prev: Profile) => Profile)) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, setProfile }) => {
    const handleProfileChange = <K extends keyof Profile>(key: K, value: Profile[K]) => {
        setProfile(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4">
            <h3 className="text-lg font-semibold text-white">Профиль</h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">URL аватара</label>
                    <input
                        type="text"
                        value={profile.avatarUrl}
                        onChange={(e) => handleProfileChange('avatarUrl', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
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
        default: return <GlobeIcon className={className} />;
    }
};

interface SocialsBlockEditorProps {
  block: SocialsBlock;
  updateBlock: (id: string, updates: Partial<SocialsBlock>) => void;
}

const SocialsBlockEditor: React.FC<SocialsBlockEditorProps> = ({ block, updateBlock }) => {
    const [newLinkPlatform, setNewLinkPlatform] = useState<SocialPlatform>(SocialPlatform.TWITTER);
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
    );
};


interface LinkBlockEditorProps {
  block: LinkBlock;
  updateBlock: (id: string, updates: Partial<LinkBlock>) => void;
}

const LinkBlockEditor: React.FC<LinkBlockEditorProps> = ({ block, updateBlock }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState(true);

  const handleGenerateTitles = async () => {
    if (!block.url || !isUrlValid) return;
    setIsLoading(true);
    setSuggestions([]);
    try {
      const titles = await geminiService.generateLinkTitles(block.title, block.url);
      setSuggestions(titles);
    } catch(error) {
        console.error("Failed to generate titles:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applySuggestion = (title: string) => {
    updateBlock(block.id, { title });
    setSuggestions([]);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    updateBlock(block.id, { url: newUrl });

    const isValid = newUrl.trim() === '' || URL_REGEX.test(newUrl);
    setIsUrlValid(isValid);

    if (!block.title.trim() && isValid) {
        const suggestedTitle = generateTitleFromUrl(newUrl);
        if (suggestedTitle) {
            updateBlock(block.id, { title: suggestedTitle });
        }
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Заголовок"
        value={block.title}
        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />
      <div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="URL"
            value={block.url}
            onChange={handleUrlChange}
            className={`flex-grow bg-gray-700 border rounded-md px-3 py-2 text-white focus:ring-2 focus:outline-none transition-colors ${
              isUrlValid
                ? 'border-gray-600 focus:ring-indigo-500'
                : 'border-red-500/70 focus:ring-red-500 ring-1 ring-red-500/50'
            }`}
          />
          <button onClick={handleGenerateTitles} disabled={isLoading || !block.url.trim() || !isUrlValid} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-2 rounded-md transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed">
            <WandSparklesIcon className="w-5 h-5" />
            {isLoading ? 'Генерация...' : 'Сгенерировать'}
          </button>
        </div>
        {!isUrlValid && (
            <p className="text-xs text-red-400 mt-1.5">Пожалуйста, введите действительный URL.</p>
        )}
      </div>
      {suggestions.length > 0 && (
        <div className="p-3 bg-gray-900 rounded-md space-y-2">
          <p className="text-sm text-gray-300">Предложения:</p>
          {suggestions.map((s, i) => (
             <button key={i} onClick={() => applySuggestion(s)} className="block w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors">{s}</button>
          ))}
        </div>
      )}
      <p className="text-sm text-gray-400 pt-1">Клики: {block.clicks}</p>
    </div>
  );
};

interface ShopBlockEditorProps {
    block: ShopBlock;
    updateBlock: (id: string, updates: Partial<ShopBlock>) => void;
}

const ShopBlockEditor: React.FC<ShopBlockEditorProps> = ({ block, updateBlock }) => {
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    const handleProductChange = (productId: string, updates: Partial<Product>) => {
        const updatedProducts = block.products.map(p => p.id === productId ? { ...p, ...updates } : p);
        updateBlock(block.id, { products: updatedProducts });
    };

    const handleGenerateDescription = async (product: Product) => {
        setLoadingStates(prev => ({ ...prev, [product.id]: true }));
        try {
            const description = await geminiService.generateProductDescription(product.name, product.price);
            handleProductChange(product.id, { description });
        } catch (error) {
            console.error("Failed to generate description:", error);
        } finally {
            setLoadingStates(prev => ({ ...prev, [product.id]: false }));
        }
    };

    const addProduct = () => {
        const newProduct: Product = { id: Date.now().toString(), name: '', price: 0, description: '', imageUrl: `https://picsum.photos/seed/${Date.now()}/400`};
        updateBlock(block.id, { products: [...block.products, newProduct] });
    };

    const removeProduct = (productId: string) => {
        updateBlock(block.id, { products: block.products.filter(p => p.id !== productId) });
    };

    return (
        <div className="space-y-4">
            <input
                type="text"
                placeholder="Название магазина"
                value={block.title}
                onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <div className="space-y-3">
                {block.products.map(product => (
                    <div key={product.id} className="bg-gray-900 p-3 rounded-lg space-y-2 border border-gray-700 relative">
                        <button onClick={() => removeProduct(product.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                        <input type="text" placeholder="Название товара" value={product.name} onChange={e => handleProductChange(product.id, { name: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white" />
                        <input type="number" placeholder="Цена" value={product.price} onChange={e => handleProductChange(product.id, { price: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white" />
                        <div className="relative">
                           <textarea placeholder="Описание" value={product.description} onChange={e => handleProductChange(product.id, { description: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white h-20 resize-none" />
                           <button onClick={() => handleGenerateDescription(product)} disabled={loadingStates[product.id]} className="absolute bottom-2 right-2 bg-indigo-600 p-1.5 rounded-md hover:bg-indigo-700 disabled:bg-indigo-800" aria-label="Сгенерировать описание">
                             <WandSparklesIcon className="w-4 h-4 text-white"/>
                           </button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={addProduct} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-md">Добавить товар</button>
        </div>
    );
};


interface ChatbotEditorProps {
    profile: ChatbotProfile | null;
    isEnabled: boolean;
    isPremium: boolean;
    setProfile: (profile: ChatbotProfile | null | ((prev: ChatbotProfile | null) => ChatbotProfile | null)) => void;
    setEnabled: (enabled: boolean) => void;
}

const ChatbotEditor: React.FC<ChatbotEditorProps> = ({ profile, isEnabled, isPremium, setProfile, setEnabled }) => {
    const [step, setStep] = useState(0);

    const handleProfileChange = (updates: Partial<ChatbotProfile>) => {
        setProfile(prev => prev ? { ...prev, ...updates } : { type: null, name: '', details: '', additionalInfo: '', ...updates });
    };

    if (!isPremium) {
        return (
            <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg text-center">
                <LockIcon className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                <h4 className="font-bold text-lg">Премиум-функция</h4>
                <p className="text-gray-400">Обновите тариф, чтобы включить ИИ-чат-бота и оказывать поддержку 24/7!</p>
                <button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg">Обновить</button>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg text-center">
                <h4 className="font-bold">Настройте вашего ИИ-ассистента</h4>
                <button onClick={() => { setProfile({ type: null, name: '', details: '', additionalInfo: '' }); setStep(1); }} className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                    Начать настройку
                </button>
            </div>
        );
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h5 className="font-bold mb-2">Ты — персона или компания?</h5>
                        <div className="flex gap-4">
                            <button onClick={() => { handleProfileChange({ type: 'person' }); setStep(2); }} className="flex-1 bg-gray-700 hover:bg-gray-600 p-2 rounded-md">Персона</button>
                            <button onClick={() => { handleProfileChange({ type: 'company' }); setStep(2); }} className="flex-1 bg-gray-700 hover:bg-gray-600 p-2 rounded-md">Компания</button>
                        </div>
                    </>
                );
            case 2:
                const nameLabel = profile.type === 'person' ? "Как тебя зовут?" : "Как называется твоя компания?";
                const detailsLabel = profile.type === 'person' ? "Чем ты занимаешься? (профессия, хобби)" : "Какие услуги вы предлагаете?";
                return (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-300">{nameLabel}</label>
                        <input type="text" value={profile.name} onChange={e => handleProfileChange({ name: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"/>
                        <label className="block text-sm font-medium text-gray-300">{detailsLabel}</label>
                        <textarea value={profile.details} onChange={e => handleProfileChange({ details: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 h-24 text-white"/>
                        <label className="block text-sm font-medium text-gray-300">Другая информация? (контакты, интересные факты)</label>
                        <textarea value={profile.additionalInfo} onChange={e => handleProfileChange({ additionalInfo: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 h-24 text-white"/>
                        <button onClick={() => setStep(0)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Сохранить профиль</button>
                    </div>
                );
            default:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-lg">ИИ-чат-бот</h4>
                            <div className="flex items-center">
                                <span className={`mr-2 text-sm ${isEnabled ? 'text-green-400' : 'text-gray-400'}`}>{isEnabled ? 'Включен' : 'Выключен'}</span>
                                <button onClick={() => setEnabled(!isEnabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-md border border-gray-700">
                            <p className="text-gray-400 text-sm capitalize"><strong>Тип:</strong> {profile.type === 'person' ? 'Персона' : 'Компания'}</p>
                            <p className="text-gray-400 text-sm"><strong>Имя:</strong> {profile.name}</p>
                        </div>
                        <button onClick={() => setStep(2)} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md">Редактировать профиль</button>
                    </div>
                );
        }
    };

    return <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg">{renderStep()}</div>;
};

const SearchBlockEditor: React.FC<{ block: SearchBlock, updateBlock: (id: string, updates: Partial<SearchBlock>) => void }> = ({ block, updateBlock }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm text-gray-400">Заголовок виджета</label>
      <input
        type="text"
        placeholder="Заголовок"
        value={block.title}
        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />
      <p className="text-sm text-gray-400">Этот блок добавляет на вашу страницу виджет поиска Google.</p>
    </div>
  );
};

interface AnalyticsWidgetProps {
    blocks: Block[];
}

const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ blocks }) => {
    const linkBlocks = blocks.filter(b => b.type === BlockType.LINK || b.type === BlockType.BUTTON) as (LinkBlock | ButtonBlock)[];
    const totalClicks = linkBlocks.reduce((sum, block) => sum + block.clicks, 0);

    return (
        <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg space-y-4">
            <div className="text-center">
                <p className="text-gray-400 text-sm">Всего кликов</p>
                <p className="text-4xl font-bold text-indigo-400">{totalClicks}</p>
            </div>
            {linkBlocks.length > 0 ? (
                <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Статистика по ссылкам:</h4>
                    <ul className="space-y-3">
                        {linkBlocks.map(block => (
                            <li key={block.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 truncate min-w-0">
                                    {block.type === BlockType.LINK ? <LinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <MousePointerClickIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                                    <span className="text-white truncate" title={block.type === BlockType.LINK ? block.title : block.text}>{block.type === BlockType.LINK ? block.title : block.text}</span>
                                </div>
                                <span className="font-bold text-white bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">{block.clicks}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p className="text-center text-gray-500">Добавьте блоки ссылок или кнопок, чтобы отслеживать клики.</p>
            )}
        </div>
    );
};

interface SeoEditorProps {
    seoConfig: SeoConfig;
    setSeoConfig: (config: SeoConfig | ((prev: SeoConfig) => SeoConfig)) => void;
    blocks: Block[];
    chatbotProfile: ChatbotProfile | null;
    isPremium: boolean;
}

const SeoEditor: React.FC<SeoEditorProps> = ({ seoConfig, setSeoConfig, blocks, chatbotProfile, isPremium }) => {
    const [isSeoLoading, setIsSeoLoading] = useState(false);

    const handleGenerateSeo = async () => {
        setIsSeoLoading(true);
        const linkTitles = blocks.filter(b => b.type === BlockType.LINK).map(b => (b as LinkBlock).title);
        const shopBlocks = blocks.filter(b => b.type === BlockType.SHOP) as ShopBlock[];
        const shopTitles = shopBlocks.map(b => b.title);
        const productNames = shopBlocks.flatMap(b => b.products.map(p => p.name));

        const contentSummary = [
            `Имя пользователя: @elazart`,
            chatbotProfile ? `Профиль: Имя: ${chatbotProfile.name}, Детали: ${chatbotProfile.details}` : 'Профиль не настроен',
            `Заголовки ссылок: ${linkTitles.join(', ')}`,
            `Названия магазинов: ${shopTitles.join(', ')}`,
            `Названия продуктов: ${productNames.join(', ')}`,
        ].join('\n');

        try {
            const result = await geminiService.generateSeoMeta(contentSummary);
            setSeoConfig(prev => ({ ...prev, description: result.description, keywords: result.keywords }));
        } catch (error) {
            console.error("Failed to generate SEO meta:", error);
        } finally {
            setIsSeoLoading(false);
        }
    };

    const handleConfigChange = <K extends keyof SeoConfig>(key: K, value: SeoConfig[K]) => {
        setSeoConfig(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Мета-заголовок</label>
                <input
                    type="text"
                    value={seoConfig.title}
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Мета-описание</label>
                <textarea
                    value={seoConfig.description}
                    onChange={(e) => handleConfigChange('description', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white h-24 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Привлекательное описание для поисковых систем (150-160 симв.)"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Ключевые слова</label>
                <textarea
                    value={seoConfig.keywords.join(', ')}
                    onChange={(e) => handleConfigChange('keywords', e.target.value.split(',').map(k => k.trim()))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white h-20 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Разделите ключевые слова запятыми"
                />
            </div>
            <button
                onClick={handleGenerateSeo}
                disabled={isSeoLoading || !isPremium}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-2 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {!isPremium && <LockIcon className="w-4 h-4" />}
                <WandSparklesIcon className="w-5 h-5" />
                {isSeoLoading ? 'Генерация...' : 'Сгенерировать описание и слова с помощью ИИ'}
            </button>
             {!isPremium && <p className="text-xs text-yellow-400/80 text-center mt-2">Доступно на премиум-тарифе.</p>}
        </div>
    );
};

interface DropZoneProps {
    onDrop: (files: FileList) => void;
    acceptedMimeTypes: string[];
    children: React.ReactNode;
}

const DropZone: React.FC<DropZoneProps> = ({ onDrop, acceptedMimeTypes, children }) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const acceptedFiles = Array.from(files).filter(file => 
                acceptedMimeTypes.some(type => file.type.startsWith(type))
            );
            if (acceptedFiles.length > 0) {
                const dataTransfer = new DataTransfer();
                acceptedFiles.forEach(file => dataTransfer.items.add(file));
                onDrop(dataTransfer.files);
            } else {
                 alert(`Неверный тип файла. Пожалуйста, загрузите ${acceptedMimeTypes.join(', ')}`);
            }
        }
    };

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                isDraggingOver ? 'border-indigo-500 bg-gray-700/50' : 'border-gray-600'
            }`}
        >
            {children}
        </div>
    );
};

interface TextBlockEditorProps {
  block: TextBlock;
  updateBlock: (id: string, updates: Partial<TextBlock>) => void;
}
const TextBlockEditor: React.FC<TextBlockEditorProps> = ({ block, updateBlock }) => (
    <textarea
        placeholder="Введите текст..."
        value={block.content}
        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white h-24 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
    />
);


interface ImageBlockEditorProps {
    block: ImageBlock;
    updateBlock: (id: string, updates: Partial<ImageBlock>) => void;
}
const ImageBlockEditor: React.FC<ImageBlockEditorProps> = ({ block, updateBlock }) => {
    const handleImageDrop = (files: FileList) => {
        if (files.length === 0) return;
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            updateBlock(block.id, { url: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-3">
            <DropZone onDrop={handleImageDrop} acceptedMimeTypes={['image/']}>
                {block.url ? (
                    <img src={block.url} alt="Загружено" className="max-h-40 mx-auto rounded-md" />
                ) : (
                    <div className="text-gray-400">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                        <p>Перетащите изображение сюда или введите URL ниже.</p>
                    </div>
                )}
            </DropZone>
            <input
                type="text"
                placeholder="URL изображения"
                value={block.url}
                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            />
            <input
                type="text"
                placeholder="Подпись"
                value={block.caption}
                onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            />
        </div>
    );
}

interface VideoBlockEditorProps {
    block: VideoBlock;
    updateBlock: (id: string, updates: Partial<VideoBlock>) => void;
}
const VideoBlockEditor: React.FC<VideoBlockEditorProps> = ({ block, updateBlock }) => {
    const handleVideoDrop = (files: FileList) => {
        if(files.length === 0) return;
        const file = files[0];
        if (block.url && block.url.startsWith('blob:')) {
            URL.revokeObjectURL(block.url);
        }
        const objectUrl = URL.createObjectURL(file);
        updateBlock(block.id, { url: objectUrl });
    };

    return (
        <div className="space-y-3">
             <DropZone onDrop={handleVideoDrop} acceptedMimeTypes={['video/']}>
                {block.url && block.url.startsWith('blob:') ? (
                    <video src={block.url} controls className="max-h-40 mx-auto rounded-md" />
                ) : (
                    <div className="text-gray-400">
                        <VideoIcon className="w-10 h-10 mx-auto mb-2" />
                        <p>Перетащите видео сюда или вставьте ссылку YouTube/Vimeo ниже.</p>
                    </div>
                )}
            </DropZone>
            <input
                type="text"
                placeholder="URL видео (YouTube, Vimeo или прямой)"
                value={block.url}
                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            />
        </div>
    );
};


interface ButtonBlockEditorProps {
  block: ButtonBlock;
  updateBlock: (id: string, updates: Partial<ButtonBlock>) => void;
  isPremium: boolean;
}
const ButtonBlockEditor: React.FC<ButtonBlockEditorProps> = ({ block, updateBlock, isPremium }) => {
  const handleStyleChange = (updates: Partial<ButtonBlock['style']>) => {
    updateBlock(block.id, { style: { ...block.style, ...updates } });
  };
  
  const handleHoverChange = (updates: Partial<ButtonBlock['style']['hover']>) => {
    handleStyleChange({ hover: { ...block.style.hover, ...updates } });
  };

  return (
    <div className="space-y-4">
      <input type="text" placeholder="Текст кнопки" value={block.text} onChange={(e) => updateBlock(block.id, { text: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"/>
      <input type="text" placeholder="URL" value={block.url} onChange={(e) => updateBlock(block.id, { url: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"/>
      
      <div className="p-3 bg-gray-900 rounded-md border border-gray-700 space-y-3">
        <h4 className="text-sm font-semibold text-gray-300">Стиль кнопки</h4>
        <div className="flex gap-2">
            <button onClick={() => handleStyleChange({ type: 'fill' })} className={`flex-1 p-2 rounded-md text-sm ${block.style.type === 'fill' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Заливка</button>
            <button 
                onClick={() => isPremium && handleStyleChange({ type: 'image' })} 
                className={`flex-1 p-2 rounded-md text-sm relative flex items-center justify-center gap-2 ${block.style.type === 'image' ? 'bg-indigo-600 text-white' : 'bg-gray-700'} ${isPremium ? 'hover:bg-gray-600' : 'cursor-not-allowed text-gray-400'}`}
            >
                {!isPremium && <LockIcon className="w-4 h-4" />}
                Изображение
            </button>
        </div>
        
        {block.style.type === 'fill' && (
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-gray-400">Цвет фона</label>
                    <input type="color" value={block.style.backgroundColor || '#6366f1'} onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })} className="w-full h-10 bg-transparent border-none cursor-pointer" />
                </div>
                 <div>
                    <label className="text-xs text-gray-400">Цвет текста</label>
                    <input type="color" value={block.style.textColor || '#ffffff'} onChange={(e) => handleStyleChange({ textColor: e.target.value })} className="w-full h-10 bg-transparent border-none cursor-pointer" />
                </div>
            </div>
        )}

        {block.style.type === 'image' && isPremium && (
            <input type="text" placeholder="URL фонового изображения" value={block.style.imageUrl || ''} onChange={(e) => handleStyleChange({ imageUrl: e.target.value })} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"/>
        )}
      </div>

      <div className="p-3 bg-gray-900 rounded-md border border-gray-700 space-y-3">
          <h4 className="text-sm font-semibold text-gray-300">Эффекты при наведении</h4>
          <div className="grid grid-cols-2 gap-3">
              <div>
                  <label className="block text-xs text-gray-400 mb-1">Тень</label>
                  <select value={block.style.hover?.shadow || 'none'} onChange={e => handleHoverChange({ shadow: e.target.value as any })} className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1.5 text-white">
                      <option value="none">Нет</option>
                      <option value="sm">Маленькая</option>
                      <option value="md">Средняя</option>
                      <option value="lg">Большая</option>
                  </select>
              </div>
               <div>
                  <label className="block text-xs text-gray-400 mb-1">Масштаб</label>
                  <select value={block.style.hover?.scale || 'none'} onChange={e => handleHoverChange({ scale: e.target.value as any })} className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1.5 text-white">
                      <option value="none">Нет</option>
                      <option value="sm">105%</option>
                      <option value="md">110%</option>
                  </select>
              </div>
          </div>
          {block.style.type === 'fill' && (
              <div>
                  <label className="text-xs text-gray-400">Цвет фона при наведении</label>
                  <input type="color" value={block.style.hover?.backgroundColor || block.style.backgroundColor} onChange={(e) => handleHoverChange({ backgroundColor: e.target.value })} className="w-full h-10 bg-transparent border-none cursor-pointer" />
              </div>
          )}
      </div>

    </div>
  );
};

interface ImageCarouselBlockEditorProps {
    block: ImageCarouselBlock;
    updateBlock: (id: string, updates: Partial<ImageCarouselBlock>) => void;
}
const ImageCarouselBlockEditor: React.FC<ImageCarouselBlockEditorProps> = ({ block, updateBlock }) => {
    const handleImageDrop = (files: FileList) => {
        const filePromises = Array.from(files).map(file => {
            return new Promise<CarouselImage>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newImage: CarouselImage = {
                        id: `${Date.now()}-${Math.random()}`,
                        url: reader.result as string,
                    };
                    resolve(newImage);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(filePromises).then(newImages => {
            updateBlock(block.id, { images: [...block.images, ...newImages] });
        });
    };
    
    const removeImage = (imageId: string) => {
        updateBlock(block.id, { images: block.images.filter(img => img.id !== imageId) });
    };

    const addImageByUrl = () => {
        const newImage: CarouselImage = { id: `${Date.now()}-${Math.random()}`, url: '' };
        updateBlock(block.id, { images: [...block.images, newImage] });
    };

    const handleUrlChange = (imageId: string, newUrl: string) => {
        const updatedImages = block.images.map(img => img.id === imageId ? { ...img, url: newUrl } : img);
        updateBlock(block.id, { images: updatedImages });
    };

    return (
        <div className="space-y-4">
            <DropZone onDrop={handleImageDrop} acceptedMimeTypes={['image/']}>
                <div className="text-gray-400">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                    <p>Перетащите одно или несколько изображений сюда.</p>
                </div>
            </DropZone>
            <div className="space-y-3">
                {block.images.map(image => (
                    <div key={image.id} className="flex items-center gap-2 bg-gray-900 p-2 rounded-md">
                        <img src={image.url} alt="thumbnail" className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="URL изображения"
                            value={image.url}
                            onChange={(e) => handleUrlChange(image.id, e.target.value)}
                            className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm"
                        />
                         <button onClick={() => removeImage(image.id)} className="p-1 text-gray-400 hover:text-red-500">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
             <button onClick={addImageByUrl} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-md text-sm">
                Добавить изображение по URL
            </button>
        </div>
    );
};


interface EditorPanelProps {
  profile: Profile;
  setProfile: (profile: Profile | ((prev: Profile) => Profile)) => void;
  blocks: Block[];
  addBlock: (type: BlockType) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (draggedId: string, targetId: string) => void;
  chatbotProfile: ChatbotProfile | null;
  chatbotEnabled: boolean;
  isPremium: boolean;
  setChatbotProfile: (profile: ChatbotProfile | null | ((prev: ChatbotProfile | null) => ChatbotProfile | null)) => void;
  setChatbotEnabled: (enabled: boolean) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  seoConfig: SeoConfig;
  setSeoConfig: (config: SeoConfig | ((prev: SeoConfig) => SeoConfig)) => void;
  importPageData: (data: any) => boolean;
}

const MAX_FREE_BLOCKS = 5;

const BlockIcon: React.FC<{ type: BlockType }> = ({ type }) => {
    const className = "w-5 h-5 text-white";
    switch(type) {
        case BlockType.SOCIALS: return <GlobeIcon className={className}/>
        case BlockType.LINK: return <LinkIcon className={className}/>
        case BlockType.SHOP: return <ShoppingCartIcon className={className}/>
        case BlockType.SEARCH: return <SearchIcon className={className}/>
        case BlockType.TEXT: return <TypeIcon className={className}/>
        case BlockType.IMAGE: return <ImageIcon className={className}/>
        case BlockType.VIDEO: return <VideoIcon className={className}/>
        case BlockType.BUTTON: return <MousePointerClickIcon className={className}/>
        case BlockType.IMAGE_CAROUSEL: return <GalleryHorizontalIcon className={className}/>
        default: return null;
    }
};

export const EditorPanel: React.FC<EditorPanelProps> = ({
  profile, setProfile,
  blocks, addBlock, updateBlock, removeBlock, reorderBlocks,
  chatbotProfile, chatbotEnabled, isPremium, setChatbotProfile, setChatbotEnabled,
  userRole, setUserRole, seoConfig, setSeoConfig, importPageData,
}) => {
    const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'analytics'>('content');
    const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [blockToDeleteId, setBlockToDeleteId] = useState<string | null>(null);
    const [importData, setImportData] = useState<any | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);
    
    useEffect(() => {
        const firstDraggableBlock = blocks.find(b => b.type !== BlockType.SOCIALS);
        if (firstDraggableBlock) {
            setActiveBlockId(firstDraggableBlock.id);
        }
    }, []);

    const toggleActive = (id: string) => {
        setActiveBlockId(prevId => (prevId === id ? null : id));
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.dataTransfer.effectAllowed = 'move';
        document.body.classList.add('dragging');
        setDraggedBlockId(id);
        setActiveBlockId(null); // Collapse all during drag
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.preventDefault();
        if (id !== draggedBlockId) {
            setDropTargetId(id);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.preventDefault();
        if (draggedBlockId && draggedBlockId !== id) {
            reorderBlocks(draggedBlockId, id);
        }
    };
    
    const handleDragEnd = () => {
        document.body.classList.remove('dragging');
        setDraggedBlockId(null);
        setDropTargetId(null);
    };

    const nonSocialBlocksCount = blocks.filter(b => b.type !== BlockType.SOCIALS).length;
    const canAddBlocks = isPremium || nonSocialBlocksCount < MAX_FREE_BLOCKS;

    const handleConfirmDelete = () => {
        if (blockToDeleteId) {
            removeBlock(blockToDeleteId);
        }
        setBlockToDeleteId(null);
    };

    const handleCancelDelete = () => {
        setBlockToDeleteId(null);
    };
    
    const handleExport = () => {
        const pageData = { profile, blocks, chatbotProfile, chatbotEnabled, seoConfig };
        const jsonString = JSON.stringify(pageData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bio-page-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setNotification("Данные успешно экспортированы!");
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const data = JSON.parse(text);
                    if (data.profile && data.blocks && data.seoConfig) {
                        setImportData(data);
                    } else {
                        setNotification("Ошибка: Неверный формат файла.");
                    }
                }
            } catch (error) {
                console.error("Failed to parse import file:", error);
                setNotification("Ошибка: Не удалось прочитать файл.");
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const confirmImport = () => {
        if (importData) {
            const success = importPageData(importData);
            if (success) {
                setNotification("Данные успешно импортированы!");
            } else {
                 setNotification("Ошибка: Неверный формат файла.");
            }
            setImportData(null);
        }
    };

    const cancelImport = () => {
        setImportData(null);
    };

    const handleShare = () => {
        const pageData = { profile, blocks, chatbotProfile, chatbotEnabled, seoConfig };
        const jsonString = JSON.stringify(pageData);
        const compressedData = compressToBase64(jsonString);
        const url = `${window.location.origin}${window.location.pathname}?data=${compressedData}`;
        setShareUrl(url);
        setIsLinkCopied(false);
        setIsShareModalOpen(true);
    };
    
    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setIsLinkCopied(true);
            setTimeout(() => {
                setIsLinkCopied(false);
                setIsShareModalOpen(false);
            }, 2000);
        });
    };

  return (
    <div className="w-full bg-gray-800 h-screen flex flex-col">
       <header className="p-4 md:p-6 border-b border-gray-700">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white">Панель управления</h1>
                    <p className="text-gray-400 text-sm">Управляйте контентом и настройками</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="application/json"
                        className="hidden"
                    />
                    <button onClick={handleShare} className="flex items-center gap-2 p-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors" title="Поделиться">
                        <Share2Icon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Поделиться</span>
                    </button>
                    <button onClick={handleImportClick} className="flex items-center gap-2 p-2 text-sm text-gray-300 bg-gray-700/50 hover:bg-gray-700 rounded-md transition-colors" title="Импортировать данные">
                        <UploadCloudIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Импорт</span>
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 p-2 text-sm text-gray-300 bg-gray-700/50 hover:bg-gray-700 rounded-md transition-colors" title="Экспортировать данные">
                        <DownloadCloudIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Экспорт</span>
                    </button>
                </div>
            </div>
        </header>

        <div className="flex border-b border-gray-700">
            <TabButton label="Контент" icon={<LinkIcon className="w-5 h-5" />} isActive={activeTab === 'content'} onClick={() => setActiveTab('content')} />
            <TabButton label="Настройки" icon={<SettingsIcon className="w-5 h-5" />} isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            <TabButton label="Аналитика" icon={<BarChartIcon className="w-5 h-5" />} isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {userRole === UserRole.ADMIN && (
            <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
                    <LockIcon className="w-5 h-5" />
                    Панель Администратора
                </h3>
                <p className="text-yellow-300/80">Здесь будут находиться инструменты для управления пользователями и настройками платформы.</p>
            </div>
        )}
        
        {activeTab === 'content' && (
            <div className="space-y-6">
                <ProfileEditor profile={profile} setProfile={setProfile} />

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white border-t border-gray-700 pt-6">Блоки контента</h3>
                    {blocks.map((block) => {
                        const isDraggable = block.type !== BlockType.SOCIALS;
                        const isActive = activeBlockId === block.id;

                        return (
                            <div key={block.id} onDragOver={(e) => isDraggable && handleDragOver(e, block.id)} onDrop={(e) => isDraggable && handleDrop(e, block.id)}>
                                {dropTargetId === block.id && <div className="h-10 rounded-lg bg-indigo-500/20 border-2 border-dashed border-indigo-400 my-2" />}
                                <div 
                                    draggable={isDraggable}
                                    onDragStart={(e) => isDraggable && handleDragStart(e, block.id)}
                                    onDragEnd={isDraggable ? handleDragEnd : undefined}
                                    className={`bg-gray-900/50 rounded-lg border transition-all duration-300 ${isActive ? 'border-indigo-500/50' : 'border-gray-700'} ${draggedBlockId === block.id ? 'opacity-30' : ''}`}
                                >
                                    <div className="flex justify-between items-center p-3 cursor-pointer" onClick={() => toggleActive(block.id)}>
                                        <div className="flex items-center gap-3 font-semibold text-gray-300">
                                            {isDraggable ? <GripVerticalIcon className="w-5 h-5 text-gray-500 cursor-grab" /> : <div className="w-5 h-5" />}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                                                <BlockIcon type={block.type} />
                                            </div>
                                            <span className={isActive ? 'text-white' : 'text-gray-300'}>{{
                                                [BlockType.SOCIALS]: 'Социальные сети', [BlockType.LINK]: 'Ссылка', [BlockType.SHOP]: 'Магазин', [BlockType.SEARCH]: 'Поиск',
                                                [BlockType.TEXT]: 'Текст', [BlockType.IMAGE]: 'Изображение', [BlockType.VIDEO]: 'Видео', [BlockType.BUTTON]: 'Кнопка',
                                                [BlockType.IMAGE_CAROUSEL]: 'Карусель',
                                            }[block.type]}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isDraggable && <button onClick={(e) => { e.stopPropagation(); setBlockToDeleteId(block.id);}} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>}
                                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${!isActive ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                    <div className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isActive ? 'max-h-[1500px]' : 'max-h-0'}`}>
                                        <div className="p-4 border-t border-gray-700/50">
                                            {block.type === BlockType.SOCIALS && <SocialsBlockEditor block={block} updateBlock={updateBlock as any} />}
                                            {block.type === BlockType.LINK && <LinkBlockEditor block={block} updateBlock={updateBlock as any} />}
                                            {block.type === BlockType.SHOP && <ShopBlockEditor block={block} updateBlock={updateBlock as any} />}
                                            {block.type === BlockType.SEARCH && <SearchBlockEditor block={block} updateBlock={updateBlock as any} />}
                                            {block.type === BlockType.TEXT && <TextBlockEditor block={block} updateBlock={updateBlock as any} />}
                                            {block.type === BlockType.IMAGE && <ImageBlockEditor block={block} updateBlock={updateBlock as any} />}
                                            {block.type === BlockType.VIDEO && <VideoBlockEditor block={block} updateBlock={updateBlock as any} />}
                                            {block.type === BlockType.BUTTON && <ButtonBlockEditor block={block} updateBlock={updateBlock as any} isPremium={isPremium} />}
                                            {block.type === BlockType.IMAGE_CAROUSEL && <ImageCarouselBlockEditor block={block} updateBlock={updateBlock as any} />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {blocks.length === 0 && <p className="text-center text-gray-500 py-4">У вас пока нет блоков. Добавьте новый, чтобы начать!</p>}

                    <div className="pt-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-white">Добавить блок</h3>
                            {!isPremium && <span className="text-sm text-gray-400">{nonSocialBlocksCount}/{MAX_FREE_BLOCKS}</span>}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <button onClick={() => addBlock(BlockType.LINK)} disabled={!canAddBlocks} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"><LinkIcon className="w-5 h-5"/> Ссылку</button>
                            <button onClick={() => addBlock(BlockType.BUTTON)} disabled={!canAddBlocks} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"><MousePointerClickIcon className="w-5 h-5"/> Кнопку</button>
                            <button onClick={() => addBlock(BlockType.TEXT)} disabled={!canAddBlocks} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"><TypeIcon className="w-5 h-5"/> Текст</button>
                            <button onClick={() => addBlock(BlockType.IMAGE)} disabled={!canAddBlocks} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"><ImageIcon className="w-5 h-5"/> Изображение</button>
                            <button onClick={() => addBlock(BlockType.VIDEO)} disabled={!canAddBlocks} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"><VideoIcon className="w-5 h-5"/> Видео</button>
                            <button onClick={() => addBlock(BlockType.IMAGE_CAROUSEL)} disabled={!canAddBlocks} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"><GalleryHorizontalIcon className="w-5 h-5"/> Карусель</button>
                            <button onClick={() => addBlock(BlockType.SHOP)} disabled={!canAddBlocks} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"><ShoppingCartIcon className="w-5 h-5"/> Магазин</button>
                            <button onClick={() => addBlock(BlockType.SEARCH)} disabled={!canAddBlocks} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"><SearchIcon className="w-5 h-5"/> Поиск</button>
                        </div>
                        {!canAddBlocks && <p className="text-center text-yellow-400/80 text-sm mt-4">Достигнут лимит блоков для бесплатного тарифа. <button className="underline font-semibold">Перейти на премиум</button>.</p>}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
            <div className="space-y-6">
                 <ChatbotEditor 
                    profile={chatbotProfile}
                    isEnabled={chatbotEnabled}
                    isPremium={isPremium}
                    setProfile={setChatbotProfile}
                    setEnabled={setChatbotEnabled}
                />
                 <SeoEditor 
                    seoConfig={seoConfig}
                    setSeoConfig={setSeoConfig}
                    blocks={blocks}
                    chatbotProfile={chatbotProfile}
                    isPremium={isPremium}
                />
            </div>
        )}

        {activeTab === 'analytics' && (
            <AnalyticsWidget blocks={blocks} />
        )}

      </main>

      {notification && (
        <div className="fixed top-20 right-6 bg-gray-700 text-white py-2 px-4 rounded-lg shadow-lg z-50 border border-gray-600 animate-fade-in-out">
            {notification}
        </div>
      )}

      {isShareModalOpen && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-lg font-bold text-white mb-2">Поделиться страницей</h3>
                <p className="text-gray-400 mb-4 text-sm">Скопируйте и отправьте эту ссылку, чтобы поделиться публичной версией вашей страницы.</p>
                <div className="flex items-center bg-gray-900 rounded-md p-1 border border-gray-600">
                    <input type="text" readOnly value={shareUrl} className="flex-1 bg-transparent px-3 py-1 text-gray-300 text-sm focus:outline-none"/>
                    <button 
                        onClick={handleCopyLink} 
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isLinkCopied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {isLinkCopied ? 'Скопировано!' : 'Копировать'}
                    </button>
                </div>
                 <div className="flex justify-end mt-6">
                    <button 
                        onClick={() => setIsShareModalOpen(false)} 
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors text-sm"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
      )}
      
      {importData && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold text-white mb-2">Подтвердите импорт</h3>
                <p className="text-gray-400 mb-6">Это перезапишет все текущие данные на странице. Вы уверены, что хотите продолжить?</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={cancelImport}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={confirmImport}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-600"
                    >
                        Импортировать
                    </button>
                </div>
            </div>
        </div>
      )}

      {blockToDeleteId && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold text-white mb-2">Подтвердите удаление</h3>
                <p className="text-gray-400 mb-6">Вы уверены, что хотите навсегда удалить этот блок? Это действие необратимо.</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={handleCancelDelete}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-600"
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};