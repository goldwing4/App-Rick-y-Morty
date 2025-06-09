type HeroId = `${string}-${string}-${string}-${string}`;

type Hero = {
  readonly id?: HeroId;
  name: string;
  age: number;
  isActive?: boolean;
};

let hero: Hero = {
  name: "thor",
  age: 1500,
};

function createHero(hero: Hero): Hero {
  const { name, age } = hero;
  return {
    id: crypto.randomUUID(),
    name,
    age,
    isActive: true,
  };
}

const thor = createHero({ name: "Thor", age: 1500 });

//Type indexing

type HeroProperties = {
  power: string;
  address: {
    planet: string;
    city: string;
  };
};

const addresHero: HeroProperties["address"] = {
  planet: "Earth",
  city: "Madrid",
};

//Type from value

const address = {
  planet: "Earth",
  city: "Madrid",
};

//type Address = typeof address

const addressTwitch: Address = {
  planet: "Mars",
  city: "Twucg",
};

//Type from function return

const createAddress = () => {
  return {
    planet: "Tierra",
    city: "Barcelona",
  };
};

type Address = ReturnType<typeof createAddress>;

//Arrays
const numbers: (boolean | string | number)[] = [];

numbers.push(2);
numbers.push("asa");
numbers.push(true);

//Enum

type Singer = {
  name: string
  age: number
  gender?: string
}

const singer: Singer = {
  name: "Billie",
  age: 23,
  gender: "F"
}

function createSinger (singer: Singer): Singer {
  const { name, age, gender } = singer;
  return {
    name,
    age,
  };
}

