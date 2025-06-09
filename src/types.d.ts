export interface ApiResponse {
    info:    Info;
    results: Result[]
}

export interface Info {
    count: number;
    pages: number;
    next:  string | null;
    prev:  string | null;
}

export interface ApiCharacter {
    id:       number;
    name:     string;
    status:   string;
    species:  string;
    type?:     string;
    gender:   string;
    origin:   Location;
    location: Location;
    image:    string;
    episode:  string[];
    url?:      string;
    created?:  Date;
}

export interface ApiEpisode {
    id:         number;
    name:       string;
    air_date:   string;
    episode:    string;
    characters: string[];
    url?:        string;
    created?:    Date;
}


export interface Location {
    name: string;
    url:  string;
}

type Filters = {
    name?: string
    status?: string
    [key: string]: string | undefined;
}

export interface DataCardElement extends HTMLElement {
  readonly dataset: DOMStringMap & {
    characterId?: string;
    episodeId?: string;
  };
}


