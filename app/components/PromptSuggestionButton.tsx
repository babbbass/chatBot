export function PromptSuggestionButton({
  text,
  onClick,
}: {
  text: string
  onClick: (text: string) => void
}) {
  return (
    <button
      className='m-3 p-2 w-15 aspect-[4/1] bg-primary text-slate-50 font-semibold text-sm rounded-full'
      onClick={() => {
        onClick(text)
      }}
    >
      {text}
    </button>
  )
}
