"use client";

import { ChatLayout } from "@/components/chat/chat-layout";
import Gamma from "@/lib/gamma";
import { getSelectedModel } from "@/lib/model-helper";
import { ChatRequestOptions } from "ai";
import { useChat } from "ai/react";
import React, { useEffect } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    setMessages,
  } = useChat();
  const [chatId, setChatId] = React.useState<string>("");
  const [selectedModel, setSelectedModel] = React.useState<string>(
    getSelectedModel()
  );
  const [gamma, setGamma] = React.useState<Gamma | null>(null);

  useEffect(() => {
    if (selectedModel === "Browser Model") {
      console.log("Selected model: Browser");
      const gammaInstance = Gamma.getInstance();
      setGamma(gammaInstance);
    }
  }, [selectedModel]);

  React.useEffect(() => {
    if (params.id) {
      const item = localStorage.getItem(`chat_${params.id}`);
      if (item) {
        setMessages(JSON.parse(item));
      }
    }
  }, [setMessages]);

  const addMessage = (Message: any) => {
    console.log("addMessage:", Message);
    messages.push(Message);
    window.dispatchEvent(new Event("storage"));
    setMessages([...messages]);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedModel === "Browser Model") {
      try {
        // Add the user message to the chat
        addMessage({ role: "user", content: input, id: chatId });

        if (gamma === null) {
          const gammaInstance = Gamma.getInstance();
          setGamma(gammaInstance);
        }

        // Generate a response
        const responseGenerator = gamma
          ? await gamma.summarize(input)
          : (async function* () {})();
        console.log("Response from Browser Model:", responseGenerator);

        let responseMessage = "";
        // Display response chunks as they arrive and append them to the message
        for await (const chunk of responseGenerator) {
          responseMessage += chunk;

          window.dispatchEvent(new Event("storage"));
          setMessages([
            ...messages,
            { role: "assistant", content: responseMessage, id: chatId },
          ]);
        }
      } catch (error) {
        console.error("Error processing message with Browser Model:", error);
      }
    } else {
      setMessages([...messages]);

      // Prepare the options object with additional body data, to pass the model.
      const requestOptions: ChatRequestOptions = {
        options: {
          body: {
            selectedModel: selectedModel,
          },
        },
      };

      // Call the handleSubmit function with the options
      handleSubmit(e, requestOptions);
    }
  };
  // When starting a new chat, append the messages to the local storage
  React.useEffect(() => {
    if (!isLoading && !error && messages.length > 0) {
      localStorage.setItem(`chat_${params.id}`, JSON.stringify(messages));
      // Trigger the storage event to update the sidebar component
      window.dispatchEvent(new Event("storage"));
    }
  }, [messages, chatId, isLoading, error]);

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center">
      <ChatLayout
        chatId={params.id}
        setSelectedModel={setSelectedModel}
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={onSubmit}
        isLoading={isLoading}
        error={error}
        stop={stop}
        navCollapsedSize={10}
        defaultLayout={[30, 160]}
      />
    </main>
  );
}
