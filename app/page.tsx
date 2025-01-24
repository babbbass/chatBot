"use client"
import { useChat } from "ai/react"
import { Message } from "ai"
import { PromptSuggestionRow } from "./components/PromptSuggestionRow"
import { Bubble } from "./components/Bubble"

import { LoadingCircle } from "./components/LoadingCircle"

export default function Home() {
  const {
    append,
    messages,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
  } = useChat({
    api: "/api/chat",
  })

  const noMessages = !messages || messages.length === 0

  const handleClick = (promptText: string) => {
    const message: Message = {
      id: crypto.randomUUID(),
      content: promptText,
      role: "user",
    }

    append(message)
  }

  return (
    <main className='w-4/5 h-4/5 max-h-[700px] bg-white rounded-2xl flex flex-col p-5 text-black'>
      <section
        className={`w-full flex-grow overflow-y-auto ${
          noMessages ? "" : "h-full flex flex-col"
        }`}
      >
        {noMessages ? (
          <>
            <br />
            <PromptSuggestionRow onPromptClick={handleClick} />
          </>
        ) : (
          <div className='flex flex-col space-y-4'>
            {messages?.map((message: Message, index: number) => (
              <Bubble key={`message-${index}`} message={message} />
            ))}
            {isLoading && <LoadingCircle />}
          </div>
        )}
      </section>
      <form
        onSubmit={handleSubmit}
        className='h-20 w-full flex border-t-2 border-t-slate-600 pt-5 overflow-hidden rounded-md mt-2'
      >
        <input
          type='text'
          onChange={handleInputChange}
          value={input}
          placeholder='Demandez moi ce que vous voulez...'
          className='w-4/5 p-3 text-base border-0 bg-primary text-slate-50 focus:outline-none'
        />
        <input
          type='submit'
          className='w-1/5 p-1 text-base bg-gold text-slate-50 border-0 focus:outline-none'
        />
      </form>
    </main>
  )
}
