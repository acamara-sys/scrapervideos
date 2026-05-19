import { Children, useState } from "react"

interface buttonProps {
    className: string | null;
    datatocopy: string; // Sera une variable à remplacer 
    children?: React.ReactNode;
}

// className: "rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-500 hover:text-white"

// Button to copy content, for example you clicked and it pop into your clipboard

 export default function ButtonCopy ({className, datatocopy, children}: buttonProps)  {

    const copyMessage = async () => {
     try {
      await navigator.clipboard.writeText(datatocopy);
     } catch (error) {
     console.error(`Couldn't copy the value ${datatocopy}`)
     }

    }

    return (
        <div>
            <button 
            className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-500 hover:text-white"
            onClick={copyMessage}
            >
                {children}
            </button>
        </div>
    )


 }



