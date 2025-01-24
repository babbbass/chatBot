import { PromptSuggestionButton } from "./PromptSuggestionButton"

export function PromptSuggestionRow({
  onPromptClick,
}: {
  onPromptClick: (text: string) => void
}) {
  const prompts = [
    "Quel est le meilleur joueur de l'histoire ?",
    "Qui est le meilleur buteur de l'histoire ?",
    "Combien de titre de champion de france a gagné le PSG ?",
    "Quel est le meilleur résultat de l'histoire du PSG ?",
  ]
  return (
    <div className='p-2 text-base'>
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton
          key={`suggestion-${index}`}
          text={prompt}
          onClick={() => onPromptClick(prompt)}
        />
      ))}
    </div>
  )
}
