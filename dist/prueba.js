"use strict";
let hero = {
    name: "thor",
    age: 1500,
};
function createHero(hero) {
    const { name, age } = hero;
    return {
        id: crypto.randomUUID(),
        name,
        age,
        isActive: true,
    };
}
const thor = createHero({ name: "Thor", age: 1500 });
const addresHero = {
    planet: "Earth",
    city: "Madrid",
};
//Type from value
const address = {
    planet: "Earth",
    city: "Madrid",
};
//type Address = typeof address
const addressTwitch = {
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
//Arrays
const numbers = [];
numbers.push(2);
numbers.push("asa");
numbers.push(true);
const singer = {
    name: "Billie",
    age: 23,
    gender: "F"
};
function createSinger(singer) {
    const { name, age, gender } = singer;
    return {
        name,
        age,
    };
}
