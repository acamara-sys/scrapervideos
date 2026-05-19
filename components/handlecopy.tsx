import { useState } from "react"

interface buttonProps {
    className: string;
    datatocopy: string; // Sera une variable à remplacer  
}

// className: "rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-500 hover:text-white"


// Button to copy content.

 export default function buttonCopy ({className, datatocopy}: buttonProps)  {


    const [texte, setTexte] = useState("");


    const copyMessage = async () => {
     await navigator.clipboard.writeText(texte);
    }

    return (
        <div>
            <button 
            className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-500 hover:text-white"
            onClick={copyMessage}
            >
            </button>
        </div>
    )


 }



