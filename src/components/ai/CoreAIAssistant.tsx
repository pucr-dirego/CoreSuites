import { useEffect, useMemo, useRef, useState } from "react";
import type { AssistantEquipo, AssistantMessage } from "./coreAssistantTypes";
import { getAssistantResponse, quickQuestions } from "./coreAssistantService";
import "../../styles/ai-assistant.css";

type CoreAIAssistantProps = {
  equipos: AssistantEquipo[];
  isOpen: boolean;
  onClose: () => void;
};

const CHAT_STORAGE_KEY = "coreinventory-ai-lite-chat";

const WELCOME_MESSAGE =
  "Hola, soy el asistente de Inventario TI. Puedo ayudarte a consultar y resumir información del inventario. Trabajo en modo solo lectura, por lo que no puedo modificar registros.";

function createMessage(role: "user" | "assistant", text: string): AssistantMessage {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    createdAt: new Date(),
  };
}

function getInitialMessages(): AssistantMessage[] {
  const welcomeMessage = createMessage("assistant", WELCOME_MESSAGE);

  try {
    const storedMessages = sessionStorage.getItem(CHAT_STORAGE_KEY);

    if (!storedMessages) {
      return [welcomeMessage];
    }

    const parsedMessages = JSON.parse(storedMessages) as AssistantMessage[];

    if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
      return [welcomeMessage];
    }

    return parsedMessages.map((message) => ({
      ...message,
      createdAt: new Date(message.createdAt),
    }));
  } catch {
    return [welcomeMessage];
  }
}

export function CoreAIAssistant({
  equipos,
  isOpen,
  onClose,
}: CoreAIAssistantProps) {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] =
    useState<AssistantMessage[]>(getInitialMessages);

  const totalEquipos = useMemo(() => equipos?.length ?? 0, [equipos]);

  useEffect(() => {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const clearChat = () => {
    const newWelcomeMessage = createMessage(
      "assistant",
      "Nuevo chat iniciado. Recuerda que trabajo en modo solo lectura y puedo ayudarte a consultar información del inventario."
    );

    setMessages([newWelcomeMessage]);
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
    setInput("");
  };

  const sendQuestion = (question: string) => {
    const cleanQuestion = question.trim();

    if (!cleanQuestion || isThinking) return;

    const userMessage = createMessage("user", cleanQuestion);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    scrollToBottom();

    window.setTimeout(() => {
      const response = getAssistantResponse(cleanQuestion, equipos);
      const assistantMessage = createMessage("assistant", response);

      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
      scrollToBottom();
    }, 450);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendQuestion(input);
  };

  if (!isOpen) return null;

  return (
    <section className="core-ai-panel" aria-label="Asistente IA de Inventario TI">
      <header className="core-ai-header">
        <div>
          <p className="core-ai-eyebrow">CoreInventory</p>
          <h2>Asistente IA-Lite</h2>
          <span>Modo solo lectura · {totalEquipos} equipos cargados</span>
        </div>

        <div className="core-ai-header-actions">
          <button
            className="core-ai-reset"
            type="button"
            onClick={clearChat}
          >
            Nuevo chat
          </button>

          <button
            className="core-ai-close"
            type="button"
            onClick={onClose}
            aria-label="Cerrar asistente"
          >
            ×
          </button>
        </div>
      </header>

      <div className="core-ai-quick-actions">
        {quickQuestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => sendQuestion(item.question)}
            disabled={isThinking}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="core-ai-messages">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`core-ai-message ${
              message.role === "user" ? "is-user" : "is-assistant"
            }`}
          >
            <div className="core-ai-bubble">{message.text}</div>
          </article>
        ))}

        {isThinking && (
          <article className="core-ai-message is-assistant">
            <div className="core-ai-bubble core-ai-thinking">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </article>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="core-ai-input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Pregúntame sobre el inventario..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isThinking}
        />

        <button type="submit" disabled={!input.trim() || isThinking}>
          Enviar
        </button>
      </form>
    </section>
  );
}