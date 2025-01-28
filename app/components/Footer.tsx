import React from "react"

export function Footer() {
  return (
    <div className='w-full md:w-4/5 max-w-screen-2xl mt-10  flex justify-between items-center p-3 text-slate-50  text-xs md:text-sm font-semibold'>
      <div>
        <ul className='flex flex-col gap-2'>
          <li>
            <a href='https://www.linkedin.com/in/sebastien-savan-76597040/'>
              Contact
            </a>
          </li>
          <li>
            <a href='https://www.psg.fr/'>PSG - site officiel</a>
          </li>
        </ul>
      </div>
      <div className='font-semibold'>
        @2025 réalisé par{" "}
        <a
          className='cursor-pointer'
          href='https://www.linkedin.com/in/sebastien-savan-76597040/'
        >
          Babbbass
        </a>
      </div>
    </div>
  )
}
