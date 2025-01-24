import Image from "next/image"
import psgBoyLogo from "../assets/psgBoyLogo.png"

export function Banner() {
  return (
    <div className='w-4/5 md:px-5 my-10'>
      <div className='flex justify-between items-center mb-5 w-full'>
        <h1 className='text-xl md:text-3xl font-semibold bg-gradient-to-r from-white to-gold text-transparent bg-clip-text '>
          PSG-BOYZ Chat
        </h1>
        <Image src={psgBoyLogo} width={75} alt='psgBoyLogo' />
      </div>
      <p className='p-0 md:px-14 text-sm md:text-lg text-slate-50 font-semibold'>
        {` L'endroit ultime pour tous les fans du Paris Saint Germain!
                      Demandez n'importe quoi a propos du club de la capitale de France 
                      et vous aurez les réponses d'actualités.
                      Nous espérons que vous appécierez l'expérience!
                  `}
      </p>
    </div>
  )
}
