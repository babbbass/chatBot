import { Message } from "ai"
export function Bubble({ message }: { message: Message }) {
  const { content, role } = message
  return (
    <div
      className={`m-2 p-2 text-xs md:text-base border-0 color-black shadow-2xl text-center w-4/5 ${
        role === "user"
          ? "rounded-tl-3xl rounded-tr-3xl rounded-br-none rounded-bl-3xl bg-primary text-slate-50 ml-auto"
          : "rounded-tl-3xl rounded-tr-3xl rounded-br-3xl rounded-bl-none bg-secondary  text-slate-50 mr-auto"
      }`}
    >
      {content}
    </div>
  )
}
