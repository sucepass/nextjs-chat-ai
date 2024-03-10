import React, { useState } from 'react';
import ChatTopbar from './chat-topbar';
import ChatList from './chat-list';
import ChatBottombar from './chat-bottombar';
import { useChat } from 'ai/react'; // Assume useChat is a custom hook for chat logic
import { v4 as uuidv4 } from 'uuid';
import { set } from 'zod';

export interface ChatProps {
  chatId?: string,
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions) => void;
  isLoading: boolean;
  error: undefined | Error;
  stop: () => void;
  addMessage: (Message: any) => void;
  }

export default function Chat ({ messages, input, handleInputChange, handleSubmit, isLoading, error, stop, setSelectedModel, chatId, addMessage }: ChatProps) {
  
  const [refresh, setRefresh] = useState(false);  
  const { setMessages } = useChat();

  addMessage = (Message) => {
    console.log('addMessage:', Message);
    messages.push(Message);
    localStorage.setItem(`chat_${Message.id}`, JSON.stringify(messages));
    input = "";
    window.dispatchEvent(new Event("storage"));
    setMessages([...messages]);
    setRefresh(!refresh);
  };


  return (
    <div className="flex flex-col justify-between w-full h-full  ">
        <ChatTopbar setSelectedModel={setSelectedModel} isLoading={isLoading}
        chatId={chatId} messages={messages} />

        <ChatList  
        setSelectedModel={setSelectedModel}
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          stop={stop}
        />

        <ChatBottombar 
          setSelectedModel={setSelectedModel}
          messages={messages}
          addMessage={addMessage}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          stop={stop}
        />

    </div>
  )
}
