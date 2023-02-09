import base from "./pokedexApi";

export default {
  getPokemons(name) {
    return base.api.get("pokemon/" + name);
  },
  getEvolutions(id) {
    return base.api.get("evolution-chain/" + id);
  },
  getEspecies(name) {
    return base.api.get("pokemon-species/" + name);
  },
};
