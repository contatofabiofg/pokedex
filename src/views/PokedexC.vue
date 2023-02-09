<script setup>
import { ref } from 'vue'
import api from '../models/methods.js'

const pokemonName = ref('')
const pokemonFounded = ref(null)
const especies = ref(null)
const evolutionId = ref(null)
const evolutions = ref(null)
const listEvolutionsNames = ref([])
const listEvolutions = ref([])
let timeout = ref(null)

let pokemonStats = ref([])
let pokemonSelected = ref('')

let looking = ref(false)

function searchPokemon() {
  pokemonFounded.value = ''
  listEvolutions.value = []
  listEvolutionsNames.value = []
  evolutionId.value = ''
  looking.value = false

  clearTimeout(timeout.value)

  if (pokemonName.value.length > 2) {
    looking.value = true

    timeout.value = setTimeout(() => {
      api.getPokemons(pokemonName.value.toLowerCase()).then((response) => {
        looking.value = false
        pokemonFounded.value = response.data
        registerPokemonStats(
          pokemonFounded.value.stats,
          pokemonFounded.value.name,
          pokemonFounded.value.sprites.front_default
        )
        searchEspecie(pokemonFounded.value.name)
      })
    }, 500)
  } else {
    pokemonFounded.value = ''
    listEvolutions.value = []
    listEvolutionsNames.value = []
    evolutionId.value = ''
  }
}

function searchEspecie(name) {
  api.getEspecies(name).then((response) => {
    especies.value = response.data
    evolutionId.value = especies.value.evolution_chain.url.substring(42, 44)
    searchEvolutions()
  })
}

function searchEvolutions() {
  api.getEvolutions(evolutionId.value).then((response) => {
    evolutions.value = response.data
    registerEvolutions(evolutions.value.chain)
  })
}

function registerEvolutions(item) {
  if (item.evolves_to.length > 0) {
    listEvolutionsNames.value.push(item.species.name)
    registerEvolutions(item.evolves_to[0])
  } else {
    listEvolutionsNames.value.push(item.species.name)
    getEvolutions(listEvolutionsNames.value)
  }
}
function getEvolutions() {
  listEvolutionsNames.value.forEach((element) => {
    api
      .getPokemons(element)
      .then((response) => listEvolutions.value.push(response.data))
  })
}

function registerPokemonStats(stats) {
  pokemonStats.value = []

  stats.forEach((element) => {
    let statName = element.stat.name
    let statValue = element.base_stat
    let obj = {}
    obj[statName] = statValue
    console.log(obj)
    pokemonStats.value.push(obj)
  })
}

function toUpper(name) {
  let first = name[0].toUpperCase()
  return first + name.substring(1)
}

function logo(name) {
  return new URL('../assets/pixel/' + name + '.png', import.meta.url).href
}
</script>

<template>
  <div
    id="container"
    class="w-[400px] h-[630px] bg-gradient-to-r from-red-500 to-red-400 border-2 border-black p-3 rounded-md flex flex-col items-center drop-shadow-lg"
  >
    <div><img src="../assets/logo.png" alt="" style="width: 200px" /></div>

    <section
      v-if="!pokemonSelected"
      class="w-full flex flex-col items-center mt-3"
    >
      <input
        v-model="pokemonName"
        placeholder="Digite três letras pra iniciar a busca"
        type="text"
        @input="searchPokemon"
        class="w-full rounded-md p-1 my-2 outline-none duration-100 text-lg border-2 border-black"
      />
      <div class="flex items-center">
        <img
          src="../assets/spinner.gif"
          alt="Procurando..."
          v-if="looking && !pokemonFounded"
          style="width: 50px"
          class="mt-10"
        />
      </div>

      <div v-if="!looking && !pokemonFounded && pokemonName.length > 2">
        <p class="text-[12px]">
          Não encontramos nenhum Pokémon. Faça uma nova busca.
        </p>
      </div>

      <div v-if="pokemonFounded" class="w-full">
        <div
          class="cursor-pointer w-full bg-white rounded-md flex p-2 border-2 border-black"
        >
          <div
            class="bg-gradient-to-tr from-blue-300 to-blue-200 w-[45%] flex rounded-md items-center justify-center"
          >
            <img
              :src="pokemonFounded.sprites.front_default"
              alt="Pokemon Image"
            />
          </div>
          <div class="w-full ml-2 text-[12px]">
            <div>
              <div class="p-1 font-bold text-xl">
                {{ toUpper(pokemonFounded.name) }}
              </div>
            </div>
            <div
              v-for="(obj, index) in pokemonStats"
              :key="index"
              class="w-full border my-1 "
            >
            
              <div
                v-for="(item, name) in obj"
                :key="name"
                class="relative flex w-full justify-between p-1 overflow-hidden"
              >
              <div :style="'width: '+ item + '%'" class="absolute top-0 left-0 h-full bg-gradient-to-r from-red-100 to-red-50 z-0"></div>
                <div class="flex z-10">
                  <div class="font-bold mr-1">{{ toUpper(name) }}:</div>
                  <div>
                    <span class="bold textBig">{{ item }}</span
                    >/100
                  </div>
                </div>
                <div class="w-5">
                  <img :src="logo(name)" alt="" role="presentation" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="listEvolutions.length > 0" class="w-full">
        <h4 class="my-2">Outros estágios</h4>
        <div class="flex w-full">
          <div
            v-for="(pokemon, index) in listEvolutions"
            :key="index"
            class="flex"
          >
            <div
              class="pointer bg-white rounded-md mr-2 p-2 flex flex-col items-center cursor-pointer border-2 border-black"
              v-if="pokemon.name != pokemonName.toLowerCase()"
              @click=";(pokemonName = pokemon.name), searchPokemon()"
            >
              <div class="bg-gradient-to-tr from-blue-300 to-blue-200">
                <img :src="pokemon.sprites.front_default" alt="Pokemon Image" />
              </div>
              <div class="mt-2">{{ toUpper(pokemon.name) }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
