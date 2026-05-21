import { useState } from "react";


export interface VideoProps {
  title: string;
  duration: string |null;
  videoId: string | null;
  miniature: string;
  profile: string;
  profileId  : string
}

interface FetchProps {  // Données qui devront être envoyé par le parent ici depuis un input.
    keyword: string; // Exemple : Manchester United, Chelsea
}

export async function fetchVideos({ keyword }: FetchProps) {

  const url = new URL(
    "https://www.googleapis.com/youtube/v3/search" 
  );
  
  // Attributs de l'URL de recherche peut être changé en fonction des besoins, resultats, geo, content, popularité.

  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", keyword);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("key", process.env.API_KEY!
  );

  console.log(url)
  console.log(process.env.API_KEY);

  const response = await fetch(url.toString());

  const data = await response.json();
  
  console.log(data)
  
  return data.items;
}


