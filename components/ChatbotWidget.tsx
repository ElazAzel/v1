import React, { useState, useRef, useEffect } from 'react';
import { BotIcon, XIcon, SendIcon, WandSparklesIcon } from './Icons';
import { getChatbotResponse } from '../services/geminiService';
import { ChatbotProfile } from '../types';

interface ChatbotWidgetProps {
  profile: ChatbotProfile;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  isError?: boolean;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const profileString = `Тип: ${profile.type}, Имя: ${profile.name}, Детали: ${profile.details}, Другая информация: ${profile.additionalInfo}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = async () => {
    if (!userInput.trim()) return;
    const newMessages: Message[] = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const botResponse = await getChatbotResponse(userInput, profileString);
      setMessages([...newMessages, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      setMessages([...newMessages, { sender: 'bot', text: "Извините, сейчас возникли проблемы с подключением.", isError: true }]);
      console.error("Chatbot error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 z-50"
        aria-label="Открыть чат-бота"
      >
        <BotIcon className="w-8 h-8" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-700">
          <header className="p-4 bg-gray-900/50 rounded-t-2xl flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center gap-3">
              <WandSparklesIcon className="w-6 h-6 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">ИИ-ассистент</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Закрыть чат-бота">
              <XIcon className="w-6 h-6" />
            </button>
          </header>

          <main className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-white text-sm break-words transition-all duration-200 transform hover:-translate-y-0.5 ${msg.sender === 'user' ? 'bg-indigo-600 hover:bg-indigo-500 rounded-br-none' : 'bg-gray-700 hover:bg-gray-600 rounded-bl-none'} ${msg.isError ? 'border border-red-500/50' : ''}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-gray-700 rounded-2xl rounded-bl-none p-3 inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          <footer className="p-4 border-t border-gray-700">
            <div className="flex items-center bg-gray-900 rounded-full">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder="Спросите о чем-нибудь..."
                className="flex-1 bg-transparent px-5 py-3 text-white placeholder-gray-500 focus:outline-none"
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading} className="p-3 text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 disabled:cursor-not-allowed" aria-label="Отправить сообщение">
                <SendIcon className="w-6 h-6" />
              </button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};