"use client";

import React, { useState, useEffect } from "react";
import { ChatProps } from "./chat";
import { Button } from "../ui/button";
import TextareaAutosize from "react-textarea-autosize";
import { PaperPlaneIcon, StopIcon } from "@radix-ui/react-icons";
import { v4 as uuidv4 } from "uuid";

// Assume Gamma is properly imported, adjust path as necessary
import Gamma from '../../lib/gamma';

export default function ChatBottombar({
  messages,
  input,
  handleInputChange,
  handleSubmit: originalHandleSubmit,
  isLoading,
  error,
  stop,
  selectedModel,
  addMessage,
}: ChatProps & {
  selectedModel: string;
  addMessage: (newMessage: any) => void;
}) {
  selectedModel = "";
  if (typeof window !== "undefined") {
    selectedModel = localStorage.getItem("selectedModel") || "";
  }
  // console.log('chat-bottombar.tsx selectedModel init:', selectedModel);
  const [message, setMessage] = useState(input);
  const [refresh, setRefresh] = useState(false);

  // Only instantiate Gamma when needed
  const [gamma, setGamma] = useState<Gamma | null>(null);
  const [chatId, setChatId] = useState<string>("");

  useEffect(() => {
    if (selectedModel === "Browser Model") {
      console.log("Selected model: Browser");
      const gammaInstance = Gamma.getInstance();
      setGamma(gammaInstance);

      ///
      // Chat ID

      const id = uuidv4();
      setChatId(id);
      // Trigger the storage event to update the sidebar component
      window.dispatchEvent(new Event("storage"));
      setRefresh(!refresh);
      //
      ///
    } else {
      setGamma(null); // Ensure we're not holding onto an unnecessary instance
    }
  }, [selectedModel]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedModel === "Browser Model") {
      try {
        // Add the user message to the chat
        addMessage({ role: "user", content: input, id: chatId });

        if (gamma === null) {
          const gammaInst = Gamma.getInstance();
          setGamma(gammaInst);
        }

        // Generate a response using the Browser Model
        // console.log('Processing message with Browser Model:', input);
        const response = gamma ? await gamma.summarize(input) : ""; // TODO: needs to show in UI

        console.log("Response from Browser Model:", response);

        // setNewMessages({ role: "user", content: response, id: chatId });
        addMessage({ role: "assistant", content: response, id: chatId });
      } catch (error) {
        console.error("Error processing message with Browser Model:", error);
      }
    } else {
      originalHandleSubmit && originalHandleSubmit(e);
    }
  };

  return (
    <div className="p-4 flex justify-between w-full items-center gap-2">
      <form
        onSubmit={handleSubmit}
        className="w-full items-center flex relative gap-2"
      >
        <TextareaAutosize
          autoComplete="off"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="border-input max-h-20 px-5 py-4 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full border rounded-full flex items-center h-14 resize-none overflow-hidden dark:bg-card/35"
        />
        <Button
          variant="ghost"
          type="submit"
          disabled={isLoading || !input.trim()}
        >
          <PaperPlaneIcon />
        </Button>
      </form>
    </div>
  );
}
