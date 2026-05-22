import { useState, useEffect } from "react";
import { fetchVideos } from "./fetchvideos";

export default function EmbedSearcher ()  {


    const [input, setInput ] = useState("");
    const [videos, setVideos ] = useState([]);

    const handleSearch = async () => {

      const response = await fetch("http://localhost:3000/api/youtube?keyword=manchester");
    
      const data = await response.json()

      console.log(data)

      setVideos(data)
      
    }

    return (

        <div className=" border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/407">
            <div className="flex flex-col mx-auto mb-5 ">
                <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Recherche par mots-clefs</h2>
                
                 <span className="text-gray-500 max-w-1xl mb-3 mt-3 ">Copie-colle un mot-clé dans la barre de recherche, tu pourra scraper plusieurs video d'un sujet précis, avec un minimum de popularité etc.. </span>

                <input 
                type="text"
                onChange={(event) => setInput(event.target.value)}
                placeholder=" Manchester United... Fc Porto.."
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
                />
            </div>

            <button 
            onClick={handleSearch}
            className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-6 py-3 w-42 h-12 mb-10 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
            Rechercher
            </button>
            <div className="rounded-3xl bg-slate-900 p-5 px-5 flex flex-col">
                <div className="bg-slate-500 ">

                    {videos.map((video) => (
                        <div key={video.id}>

                        </div>
                    ))}
                
 

                </div>
            </div>
        </div>
    )

}