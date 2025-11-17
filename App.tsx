import React, { useState, useEffect, useRef } from 'react';
import { Block, BlockType, LinkBlock, ShopBlock, ChatbotProfile, UserRole, SearchBlock, SeoConfig, Profile, SocialPlatform, ButtonBlock } from './types';
import { EditorPanel } from './components/EditorPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { EyeIcon, PencilIcon } from './components/Icons';
import { decompressFromBase64 } from './utils/compression';

const initialBlocks: Block[] = [
  {
    id: 'socials-1',
    type: BlockType.SOCIALS,
    links: [
      { id: 's1', platform: SocialPlatform.INSTAGRAM, url: 'https://instagram.com/google' },
      { id: 's2', platform: SocialPlatform.TELEGRAM, url: 'https://t.me/google' },
      { id: 's3', platform: SocialPlatform.YOUTUBE, url: 'https://youtube.com/google' },
      { id: 's4', platform: SocialPlatform.TIKTOK, url: 'https://tiktok.com/@google' },
    ],
  },
  { id: '1', type: BlockType.LINK, title: 'Мое портфолио', url: 'https://example.com', clicks: 102 },
  { id: 'text-1', type: BlockType.TEXT, content: 'Я Frontend-разработчик и создатель цифровых продуктов. Здесь вы найдете все мои проекты, ссылки и продукты.'},
  {
    id: 'carousel-1',
    type: BlockType.IMAGE_CAROUSEL,
    images: [
        { id: 'c1', url: 'https://images.unsplash.com/photo-1606240724602-5b21f894590c?q=80&w=800' },
        { id: 'c2', url: 'https://images.unsplash.com/photo-1593349480503-685d1a4a4f36?q=80&w=800' },
        { id: 'c3', url: 'https://images.unsplash.com/photo-1617053315000-22f275e7a25c?q=80&w=800' },
    ]
  },
  { 
    id: 'button-1', 
    type: BlockType.BUTTON, 
    text: 'Связаться со мной', 
    url: 'mailto:example@example.com', 
    clicks: 42, 
    style: {
      type: 'fill', 
      backgroundColor: '#818cf8', 
      textColor: '#ffffff',
      hover: {
        shadow: 'lg',
        scale: 'sm',
        backgroundColor: '#6366f1'
      }
    }
  },
  {
    id: '3',
    type: BlockType.SHOP,
    title: 'Мои цифровые продукты',
    products: [
      { id: 'p1', name: 'Книга "Искусство кода"', price: 19.99, description: 'Глубокое погружение в мастерство разработки.', imageUrl: 'https://picsum.photos/seed/product1/400' },
      { id: 'p2', name: 'UI Kit Pro', price: 49.00, description: 'Ускорьте свой рабочий процесс.', imageUrl: 'https://picsum.photos/seed/product2/400' },
    ],
  },
];

const initialProfile: Profile = {
    avatarUrl: 'https://picsum.photos/128',
    username: '@elazart',
    bio: 'Добро пожаловать! Все мои ссылки и проекты ниже.',
    handle: 'elazart',
    avatarFrameId: '',
};

const initialSeoConfig: SeoConfig = {
    title: '@elazart | Личная страница',
    description: 'Добро пожаловать на мою личную страницу! Здесь вы найдете все мои проекты, ссылки и продукты.',
    keywords: ['личная страница', 'портфолио', 'проекты', 'elazart'],
};


export interface PageData {
  profile: Profile;
  blocks: Block[];
  chatbotProfile: ChatbotProfile | null;
  chatbotEnabled: boolean;
  seoConfig: SeoConfig;
}

interface TrialInfo {
  isActive: boolean;
  daysLeft: number | null;
}

const sanitizeHandle = (username: string): string => {
  if (!username) return '';
  return username
    .replace(/^@/, '') // remove leading @
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // remove invalid chars
    .replace(/-+/g, '-') // collapse multiple dashes
    .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes
};

// Debounce utility
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
  
    const debounced = (...args: Parameters<F>) => {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(() => func(...args), waitFor);
    };
  
    return debounced;
};


const App: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [chatbotProfile, setChatbotProfile] = useState<ChatbotProfile | null>(null);
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({ isActive: false, daysLeft: null });
  const [userRole, setUserRole] = useState<UserRole>(UserRole.CLIENT);
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [seoConfig, setSeoConfig] = useState<SeoConfig>(initialSeoConfig);
  const [isLoading, setIsLoading] = useState(true);


  const setPageData = (data: PageData | null) => {
    const pData = data || { 
        profile: initialProfile, 
        blocks: initialBlocks, 
        seoConfig: initialSeoConfig, 
        chatbotProfile: {
            type: 'person',
            name: 'Elazart',
            details: 'Frontend-разработчик и создатель цифровых продуктов.',
            additionalInfo: 'Я автор книги "Искусство кода".',
        }, 
        chatbotEnabled: true 
    };
    
    const loadedProfile = pData.profile;
    if (!loadedProfile.handle) {
      loadedProfile.handle = sanitizeHandle(loadedProfile.username);
    }
    setProfile(loadedProfile);
    setBlocks(pData.blocks);
    setChatbotProfile(pData.chatbotProfile);
    setChatbotEnabled(pData.chatbotEnabled);
    setSeoConfig(pData.seoConfig);
    document.title = pData.seoConfig.title || 'Bio Page';
  };

  const loadFromLocalStorage = (uid: string) => {
    const savedData = localStorage.getItem(`linkmax-pageData-${uid}`);
    if (savedData) {
        setPageData(JSON.parse(savedData));
    } else {
        setPageData(null); 
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareData = urlParams.get('data');

    let localUserId = localStorage.getItem('linkmax-userId');
    if (!localUserId) {
        localUserId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem('linkmax-userId', localUserId);
    }
    setUserId(localUserId);

    if (shareData) {
        try {
            const decompressedString = decompressFromBase64(shareData);
            if (decompressedString) {
                const data = JSON.parse(decompressedString);
                if (data.profile && data.blocks && data.seoConfig) {
                    setPageData(data as PageData);
                    setViewMode('preview'); // Set to preview mode when loading shared data
                } else {
                    loadFromLocalStorage(localUserId);
                }
            } else {
                 loadFromLocalStorage(localUserId);
            }
        } catch (e) {
            console.error("Failed to parse shared data, loading local data.", e);
            loadFromLocalStorage(localUserId);
        }
    } else {
        loadFromLocalStorage(localUserId);
    }

    setIsLoading(false);
  }, []);
  
  const debouncedSave = useRef(
    debounce((uid: string, data: PageData) => {
      localStorage.setItem(`linkmax-pageData-${uid}`, JSON.stringify(data));
    }, 1000)
  ).current;

  useEffect(() => {
    if (userId) {
        debouncedSave(userId, { profile, blocks, chatbotProfile, chatbotEnabled, seoConfig });
    }
  }, [profile, blocks, chatbotProfile, chatbotEnabled, seoConfig, userId, debouncedSave]);

  useEffect(() => {
    const REGISTRATION_DATE_KEY = 'userRegistrationDate';
    let regDateString = localStorage.getItem(REGISTRATION_DATE_KEY);

    if (!regDateString) {
        regDateString = new Date().toISOString();
        localStorage.setItem(REGISTRATION_DATE_KEY, regDateString);
    }

    const regDate = new Date(regDateString);
    const now = new Date();
    const trialEndDate = new Date(regDate);
    trialEndDate.setDate(regDate.getDate() + 7);

    const timeLeft = trialEndDate.getTime() - now.getTime();
    
    if (timeLeft > 0) {
        const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
        setTrialInfo({ isActive: true, daysLeft });
    } else {
        setTrialInfo({ isActive: false, daysLeft: 0 });
    }
  }, []);

  useEffect(() => {
    const newHandle = sanitizeHandle(profile.username);
    if (newHandle !== profile.handle) {
        setProfile(prev => ({ ...prev, handle: newHandle }));
    }
  }, [profile.username, profile.handle]);


  const addBlock = (type: BlockType) => {
    const newId = Date.now().toString();
    let newBlock: Block;
    switch (type) {
      case BlockType.LINK:
        newBlock = { id: newId, type: BlockType.LINK, title: 'Новая ссылка', url: '', clicks: 0 };
        break;
      case BlockType.SHOP:
        newBlock = { id: newId, type: BlockType.SHOP, title: 'Мой магазин', products: [] };
        break;
      case BlockType.SEARCH:
        newBlock = { id: newId, type: BlockType.SEARCH, title: 'Поиск в реальном времени' };
        break;
      case BlockType.TEXT:
        newBlock = { id: newId, type: BlockType.TEXT, content: 'Введите здесь свой текст...' };
        break;
      case BlockType.IMAGE:
        newBlock = { id: newId, type: BlockType.IMAGE, url: '', caption: '' };
        break;
      case BlockType.VIDEO:
        newBlock = { id: newId, type: BlockType.VIDEO, url: '' };
        break;
      case BlockType.BUTTON:
        newBlock = { id: newId, type: BlockType.BUTTON, text: 'Нажми меня', url: '', clicks: 0, style: { type: 'fill', backgroundColor: '#6366f1', textColor: '#ffffff', hover: { shadow: 'none', scale: 'none', backgroundColor: '#4f46e5' } } };
        break;
      case BlockType.IMAGE_CAROUSEL:
        newBlock = { id: newId, type: BlockType.IMAGE_CAROUSEL, images: [] };
        break;
      default:
        return;
    }
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(block => (block.id === id ? { ...block, ...updates } as Block : block)));
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };
  
  const reorderBlocks = (draggedId: string, targetId: string) => {
    setBlocks(prev => {
        const draggedIndex = prev.findIndex(b => b.id === draggedId);
        const targetIndex = prev.findIndex(b => b.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) return prev;

        const newBlocks = [...prev];
        const [draggedItem] = newBlocks.splice(draggedIndex, 1);
        newBlocks.splice(targetIndex, 0, draggedItem);
        return newBlocks;
    });
  };

  const handleLinkClick = (id: string) => {
    setBlocks(prev => prev.map(block => {
        if (block.id === id && (block.type === BlockType.LINK || block.type === BlockType.BUTTON)) {
            return { ...block, clicks: (block.clicks || 0) + 1 };
        }
        return block;
    }));
  };
  
  const importPageData = (data: PageData): boolean => {
    if (data.profile && data.blocks && data.seoConfig) {
      setPageData(data);
      return true;
    }
    return false;
  };
  
  if (isLoading) {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white text-lg">Загрузка...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <button
        onClick={() => setViewMode(prev => (prev === 'editor' ? 'preview' : 'editor'))}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
        aria-label={viewMode === 'editor' ? 'Переключиться на просмотр' : 'Переключиться на редактор'}
      >
        {viewMode === 'editor' ? <EyeIcon className="w-6 h-6" /> : <PencilIcon className="w-6 h-6" />}
      </button>

      <div className={viewMode === 'preview' ? 'block' : 'hidden'}>
        <PreviewPanel
          profile={profile}
          blocks={blocks}
          chatbotProfile={chatbotProfile}
          chatbotEnabled={chatbotEnabled && trialInfo.isActive}
          onLinkClick={handleLinkClick}
          reorderBlocks={reorderBlocks}
          isEditor={true}
        />
      </div>

      <div className={viewMode === 'editor' ? 'block' : 'hidden'}>
        <EditorPanel
          profile={profile}
          setProfile={setProfile}
          blocks={blocks}
          addBlock={addBlock}
          updateBlock={updateBlock}
          removeBlock={removeBlock}
          reorderBlocks={reorderBlocks}
          chatbotProfile={chatbotProfile}
          chatbotEnabled={chatbotEnabled}
          isPremium={trialInfo.isActive}
          setChatbotProfile={setChatbotProfile}
          setChatbotEnabled={setChatbotEnabled}
          userRole={userRole}
          setUserRole={setUserRole}
          seoConfig={seoConfig}
          setSeoConfig={setSeoConfig}
          importPageData={importPageData}
          trialInfo={trialInfo}
        />
      </div>
    </div>
  );
};

export default App;