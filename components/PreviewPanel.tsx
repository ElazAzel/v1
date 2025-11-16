
import React, { useState, useEffect, useRef } from 'react';
import { Block, BlockType, LinkBlock, Product, ShopBlock, ChatbotProfile, SearchBlock, Profile, SocialsBlock, SocialPlatform, TextBlock, ImageBlock, VideoBlock, ButtonBlock, ImageCarouselBlock, CarouselImage } from '../types';
import { ShoppingCartIcon, SearchIcon, SendIcon, TwitterIcon, InstagramIcon, GithubIcon, TelegramIcon, LinkedinIcon, GlobeIcon, ShareIcon } from './Icons';
import { ChatbotWidget } from './ChatbotWidget';
import * as geminiService from '../services/geminiService';


interface CartItem {
  product: Product;
  quantity: number;
}

const SocialIcon: React.FC<{ platform: SocialPlatform }> = ({ platform }) => {
    const className = "w-6 h-6 text-gray-300 hover:text-white transition-colors";
    switch (platform) {
        case SocialPlatform.TWITTER: return <TwitterIcon className={className} />;
        case SocialPlatform.INSTAGRAM: return <InstagramIcon className={className} />;
        case SocialPlatform.GITHUB: return <GithubIcon className={className} />;
        case SocialPlatform.TELEGRAM: return <TelegramIcon className={className} />;
        case SocialPlatform.LINKEDIN: return <LinkedinIcon className={className} />;
        default: return <GlobeIcon className={className} />;
    }
};

const PublicSocialsBlock: React.FC<{ block: SocialsBlock }> = ({ block }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const toggleShareMenu = () => {
    setIsShareOpen(prev => !prev);
    setIsLinkCopied(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsLinkCopied(true);
      setTimeout(() => {
        setIsLinkCopied(false);
        setIsShareOpen(false);
      }, 2000);
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const pageTitle = document.title;
  const pageUrl = window.location.href;

  return (
    <div className="flex justify-center items-center gap-5">
      {block.links.map(link => (
        <a 
          key={link.id} 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label={`Visit my ${link.platform} profile`}
          className="transform hover:scale-110 transition-transform"
        >
          <SocialIcon platform={link.platform} />
        </a>
      ))}
      <div className="relative" ref={shareMenuRef}>
        <button
          onClick={toggleShareMenu}
          aria-label="Share this page"
          className="transform hover:scale-110 transition-transform text-gray-300 hover:text-white"
        >
          <ShareIcon className="w-6 h-6" />
        </button>
        {isShareOpen && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-gray-700 rounded-lg shadow-xl border border-gray-600/50 p-2 z-20">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={copyLink}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-600 rounded-md transition-colors"
                >
                  {isLinkCopied ? 'Ссылка скопирована!' : 'Копировать ссылку'}
                </button>
              </li>
              <li>
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Check out this page: ${pageTitle}`)}&body=${encodeURIComponent(`I found this cool page, you should check it out: ${pageUrl}`)}`}
                  className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-600 rounded-md transition-colors"
                >
                  Отправить по E-mail
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const PublicLinkBlock: React.FC<{ block: LinkBlock, onLinkClick: (id: string) => void }> = ({ block, onLinkClick }) => (
  <a
    href={block.url}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => onLinkClick(block.id)}
    className="block w-full bg-gray-700/50 backdrop-blur-md border border-gray-600/50 text-white text-sm sm:text-base font-semibold text-center py-3 sm:py-4 px-4 sm:px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:bg-indigo-600/60 hover:shadow-lg hover:shadow-indigo-500/30"
  >
    {block.title}
  </a>
);

const PublicShopBlock: React.FC<{ block: ShopBlock }> = ({ block }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="w-full bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">{block.title}</h3>
        <div className="relative">
          <ShoppingCartIcon className="w-6 h-6 text-gray-300" />
          {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{totalItems}</span>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {block.products.map(product => (
          <div key={product.id} className="bg-gray-700/80 rounded-lg overflow-hidden shadow-lg border border-gray-600/50">
            <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover" />
            <div className="p-3">
              <h4 className="font-semibold text-white truncate">{product.name}</h4>
              <p className="text-sm text-gray-300">${product.price.toFixed(2)}</p>
              <button onClick={() => addToCart(product)} className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-1.5 px-3 rounded-md transition-colors">
                В корзину
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PublicSearchBlock: React.FC<{ block: SearchBlock }> = ({ block }) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setResult(null);
        try {
            const searchResult = await geminiService.getSearchResults(query);
            setResult(searchResult);
        } catch (error) {
            console.error("Search failed:", error);
            setResult({ text: 'Произошла ошибка во время поиска. Пожалуйста, попробуйте снова.', sources: [] });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="w-full bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm space-y-4 border border-gray-700/50">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <SearchIcon className="w-5 h-5" />
                {block.title}
            </h3>
            <div className="flex items-center bg-gray-900/70 rounded-full border border-gray-700">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
                    placeholder="Задайте вопрос о текущих событиях..."
                    className="flex-1 bg-transparent px-5 py-3 text-white placeholder-gray-500 focus:outline-none"
                    disabled={isLoading}
                />
                <button onClick={handleSearch} disabled={isLoading} className="p-3 text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 disabled:cursor-not-allowed">
                    <SendIcon className="w-6 h-6" />
                </button>
            </div>
            {isLoading && (
                 <div className="text-center text-gray-400 p-4">Поиск...</div>
            )}
            {result && (
                <div className="mt-4 p-3 bg-gray-900/70 rounded-md space-y-3">
                    <p className="text-white whitespace-pre-wrap">{result.text}</p>
                    {result.sources.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-1">Источники:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {result.sources.map((source, index) => (
                                    <li key={index}>
                                        <a href={source.web?.uri || '#'} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-sm truncate block">
                                            {source.web?.title || source.web?.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const PublicTextBlock: React.FC<{ block: TextBlock }> = ({ block }) => (
  <p className="w-full text-white text-sm sm:text-base text-center whitespace-pre-wrap px-2">
    {block.content}
  </p>
);

const PublicImageBlock: React.FC<{ block: ImageBlock }> = ({ block }) => (
  <figure className="w-full">
    {block.url && <img src={block.url} alt={block.caption || 'User content'} className="w-full rounded-lg object-cover" />}
    {block.caption && <figcaption className="text-center text-xs text-gray-400 mt-2">{block.caption}</figcaption>}
  </figure>
);

const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getVimeoId = (url: string) => {
    const regExp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
    const match = url.match(regExp);
    return match ? match[3] : null;
}

const PublicVideoBlock: React.FC<{ block: VideoBlock }> = ({ block }) => {
    if (!block.url) return null;

    const youtubeId = getYouTubeId(block.url);
    if (youtubeId) {
        return (
            <div className="w-full aspect-video">
                <iframe
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }
    
    const vimeoId = getVimeoId(block.url);
    if (vimeoId) {
        return (
            <div className="w-full aspect-video">
                <iframe
                    className="w-full h-full rounded-lg"
                    src={`https://player.vimeo.com/video/${vimeoId}`}
                    title="Vimeo video player"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        )
    }

    return (
        <div className="w-full">
            <video src={block.url} controls className="w-full rounded-lg" />
        </div>
    );
};

const PublicButtonBlock: React.FC<{ block: ButtonBlock, onLinkClick: (id: string) => void }> = ({ block, onLinkClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const baseStyle: React.CSSProperties = {};
    
    if (block.style.type === 'image' && block.style.imageUrl) {
        baseStyle.backgroundImage = `url(${block.style.imageUrl})`;
        baseStyle.backgroundSize = 'cover';
        baseStyle.backgroundPosition = 'center';
        baseStyle.textShadow = '0px 1px 4px rgba(0, 0, 0, 0.5)';
    }

    const dynamicStyle: React.CSSProperties = { ...baseStyle };

    if (block.style.type === 'fill') {
        dynamicStyle.color = block.style.textColor;
        dynamicStyle.backgroundColor = isHovered && block.style.hover?.backgroundColor
            ? block.style.hover.backgroundColor
            : block.style.backgroundColor;
    }

    const hoverClasses = {
        shadow: {
            sm: 'hover:shadow-sm',
            md: 'hover:shadow-md',
            lg: 'hover:shadow-lg',
            none: '',
        },
        scale: {
            sm: 'hover:scale-105',
            md: 'hover:scale-110',
            none: '',
        }
    };
    
    const shadowClass = hoverClasses.shadow[block.style.hover?.shadow || 'none'];
    const scaleClass = hoverClasses.scale[block.style.hover?.scale || 'none'];

    return (
        <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onLinkClick(block.id)}
            style={dynamicStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`block w-full text-white text-sm sm:text-base font-semibold text-center py-3 sm:py-4 px-4 sm:px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-gray-600/50 ${shadowClass} ${scaleClass}`}
        >
            {block.text}
        </a>
    );
};

const PublicImageCarouselBlock: React.FC<{ block: ImageCarouselBlock }> = ({ block }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!block.images || block.images.length === 0) {
        return null;
    }

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? block.images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === block.images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    return (
        <div className="w-full aspect-w-4 aspect-h-3 relative rounded-lg overflow-hidden">
            <div className="w-full h-full flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {block.images.map((image) => (
                    <img key={image.id} src={image.url} alt="Carousel image" className="w-full h-full object-cover flex-shrink-0" />
                ))}
            </div>

            <button onClick={goToPrevious} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors z-10">
                &#10094;
            </button>
            <button onClick={goToNext} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors z-10">
                &#10095;
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {block.images.map((_, index) => (
                    <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full transition-colors ${currentIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`} />
                ))}
            </div>
        </div>
    );
};


interface PreviewPanelProps {
  profile: Profile;
  blocks: Block[];
  chatbotProfile: ChatbotProfile | null;
  chatbotEnabled: boolean;
  onLinkClick: (id: string) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ profile, blocks, chatbotProfile, chatbotEnabled, onLinkClick }) => {
  return (
    <div className="w-full h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1536566482680-fca31930a085?q=80&w=1920&auto=format&fit=crop')" }}>
      <div className="w-full h-full bg-gray-900/80 backdrop-blur-sm flex justify-center p-4 md:py-10 md:px-4">
        <div className="w-full max-w-sm h-full bg-black rounded-[40px] shadow-2xl p-2 border-4 border-gray-700 overflow-hidden relative">
          <div className="w-full h-full bg-gradient-to-b from-gray-800 to-black rounded-[32px] overflow-y-auto">
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-10" />
            <div className="p-4 flex flex-col items-center space-y-4 pt-12">
              <img src={profile.avatarUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-600 shadow-lg" />
              <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
              <p className="text-center text-gray-300 text-sm">{profile.bio}</p>
              
              <div className="w-full space-y-4 pt-4">
                {blocks.map(block => {
                  switch (block.type) {
                    case BlockType.SOCIALS:
                      return <PublicSocialsBlock key={block.id} block={block} />;
                    case BlockType.LINK:
                      return <PublicLinkBlock key={block.id} block={block} onLinkClick={onLinkClick} />;
                    case BlockType.SHOP:
                      return <PublicShopBlock key={block.id} block={block} />;
                    case BlockType.SEARCH:
                      return <PublicSearchBlock key={block.id} block={block} />;
                    case BlockType.TEXT:
                        return <PublicTextBlock key={block.id} block={block} />;
                    case BlockType.IMAGE:
                        return <PublicImageBlock key={block.id} block={block} />;
                    case BlockType.VIDEO:
                        return <PublicVideoBlock key={block.id} block={block} />;
                    case BlockType.BUTTON:
                        return <PublicButtonBlock key={block.id} block={block} onLinkClick={onLinkClick} />;
                    case BlockType.IMAGE_CAROUSEL:
                        return <PublicImageCarouselBlock key={block.id} block={block} />;
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          </div>
          {chatbotEnabled && chatbotProfile && <ChatbotWidget profile={chatbotProfile} />}
        </div>
      </div>
    </div>
  );
};