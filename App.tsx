import React, { useState, useEffect } from 'react';
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
      { id: 's1', platform: SocialPlatform.TWITTER, url: 'https://x.com/google' },
      { id: 's2', platform: SocialPlatform.GITHUB, url: 'https://github.com/google' },
      { id: 's3', platform: SocialPlatform.INSTAGRAM, url: 'https://instagram.com/google' },
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

interface PageData {
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

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [profile, setProfile] = useState<Profile>({
      avatarUrl: 'https://picsum.photos/128',
      username: '@elazart',
      bio: 'Добро пожаловать! Все мои ссылки и проекты ниже.',
  });
  const [chatbotProfile, setChatbotProfile] = useState<ChatbotProfile | null>({
    type: 'person',
    name: 'Elazart',
    details: 'Frontend-разработчик и создатель цифровых продуктов. Я специализируюсь на создании красивых и функциональных пользовательских интерфейсов с использованием React и TypeScript.',
    additionalInfo: 'Я автор книги "Искусство кода" и создатель "UI Kit Pro", которые вы можете найти в моем магазине на этой странице. Также я веду блог о веб-разработке и делюсь своими проектами на GitHub.',
  });
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({ isActive: false, daysLeft: null });
  const [userRole, setUserRole] = useState<UserRole>(UserRole.CLIENT);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('preview');
  const [seoConfig, setSeoConfig] = useState<SeoConfig>({
    title: '@elazart | Личная страница',
    description: 'Добро пожаловать на мою личную страницу! Здесь вы найдете все мои проекты, ссылки и продукты.',
    keywords: ['личная страница', 'портфолио', 'проекты', 'elazart'],
  });
  const [isPublicView, setIsPublicView] = useState(false);

  useEffect(() => {
    // Logic for 7-day premium trial
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

    // Logic for loading shared pages
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get('data');

      if (dataParam) {
        const jsonString = decompressFromBase64(dataParam);
        if (jsonString) {
          const pageData: PageData = JSON.parse(jsonString);
          if (pageData.profile && pageData.blocks && pageData.seoConfig) {
            setProfile(pageData.profile);
            setBlocks(pageData.blocks);
            setChatbotProfile(pageData.chatbotProfile);
            setChatbotEnabled(pageData.chatbotEnabled);
            setSeoConfig(pageData.seoConfig);
            setIsPublicView(true);
            document.title = pageData.seoConfig.title || 'Bio Page';
          }
        }
      }
    } catch (error) {
      console.error("Failed to load page data from URL:", error);
    }
  }, []);


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
      setProfile(data.profile);
      setBlocks(data.blocks);
      setChatbotProfile(data.chatbotProfile);
      setChatbotEnabled(data.chatbotEnabled);
      setSeoConfig(data.seoConfig);
      return true;
    }
    return false;
  };

  if (isPublicView) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            <div className="w-full">
                <PreviewPanel 
                    profile={profile} 
                    blocks={blocks} 
                    chatbotProfile={chatbotProfile} 
                    chatbotEnabled={chatbotEnabled}
                    onLinkClick={handleLinkClick}
                />
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800/70 backdrop-blur-sm p-2 rounded-full flex gap-2 border border-gray-600">
        <button
          onClick={() => setMobileView('preview')}
          className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors ${
            mobileView === 'preview' ? 'bg-indigo-600 text-white' : 'text-gray-300'
          }`}
        >
          <EyeIcon className="w-5 h-5" /> Просмотр
        </button>
        <button
          onClick={() => setMobileView('editor')}
          className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors ${
            mobileView === 'editor' ? 'bg-indigo-600 text-white' : 'text-gray-300'
          }`}
        >
          <PencilIcon className="w-5 h-5" /> Редактор
        </button>
      </div>

      <div className={`w-full md:w-1/3 ${mobileView !== 'preview' && 'hidden'} md:!flex`}>
        <PreviewPanel profile={profile} blocks={blocks} chatbotProfile={chatbotProfile} chatbotEnabled={chatbotEnabled && trialInfo.isActive} onLinkClick={handleLinkClick} />
      </div>

      <div className={`w-full md:w-2/3 ${mobileView !== 'editor' && 'hidden'} md:!flex`}>
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