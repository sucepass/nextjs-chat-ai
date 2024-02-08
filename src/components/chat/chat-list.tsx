import { Message, useChat } from "ai/react";
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "../ui/avatar";
import { ChatProps } from "./chat";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";

export default function ChatList({ messages, input, handleInputChange, handleSubmit, isLoading, error, stop }: ChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end"});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  
  if (messages.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="flex flex-col gap-4 items-center">
            <Image
              src="/ollama.png"
              alt="AI"
              width={60}
              height={60}
              className="h-20 w-14 object-contain dark:invert"
            />
          <p className="text-center text-lg text-muted-foreground">How can I help you today?</p>
        </div>
      </div>
    );
  }

  return (
    <div id="scroller" className="w-full overflow-y-scroll overflow-x-hidden h-full justify-end">
      <div
      
        className="w-full flex flex-col overflow-x-hidden overflow-y-hidden min-h-full justify-end"
      >
        {messages.map((message, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, scale: 1, y: 20, x: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 1, y: 20, x: 0 }}
            transition={{
              opacity: { duration: 0.1 },
              layout: {
                type: "spring",
                bounce: 0.3,
                duration: messages.indexOf(message) * 0.05 + 0.2,
              },
            }}
            className={cn(
              "flex flex-col gap-2 p-4 whitespace-pre-wrap",
              message.role === "user" ? "items-end" : "items-start"
            )}
          >
            <div className="flex gap-3 items-center">
              {message.role === "user" && (
                <div className="flex items-end gap-3">
                  <span className="bg-accent p-3 rounded-md max-w-2xl">
                    {message.content}
                  </span>
                  <Avatar className="flex justify-start items-center overflow-hidden">
                    <AvatarImage
                      src="/user.jpg"
                      alt="AI"
                      width={6}
                      height={6}
                      className="object-contain"
                    />
                  </Avatar>
                </div>
              )}
              {message.role === "assistant" && (
                <div className="flex items-end gap-2">
                  <Avatar className="flex justify-start items-center">
                    <AvatarImage
                      src="/ollama.png"
                      alt="AI"
                      width={6}
                      height={6}
                      className="object-contain dark:invert"
                    />
                  </Avatar>
                  <span className="bg-accent p-3 rounded-md max-w-2xl overflow-x-auto">
                    {message.content}
                    {isLoading && messages.indexOf(message) === messages.length - 1 && (
                      <span className="animate-pulse" aria-label="Typing">
                        ...
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
        <div id="anchor" ref={bottomRef}></div>
    </div>
  );
}
