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
          pokemonFounded.value.sprites.versions['generation-v']['black-white'].animated.front_default
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

    pokemonStats.value.push(obj)
  })
}

function toUpper(name) {
  let first = name[0].toUpperCase()
  return first + name.substring(1)
}

function logo(name) {
  return new URL('../assets/' + name + '.png', import.meta.url).href
}
</script>

<template>

  <div
      class="img relative min-w-[700px] h-[600px]"
  >

    
      <input
        v-model="pokemonName"
        placeholder="Nome completo do Pokemon"
        type="text"
        @input="searchPokemon"
        class="absolute w-[250px] bottom-[50px] left-[50px] rounded-md p-1 my-2 outline-none duration-100 text-lg border-2 border-zinc-600"
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
        <img
        v-if="pokemonFounded"
              :src="pokemonFounded.sprites.versions['generation-v']['black-white'].animated.front_default"
              alt="Pokemon Image"
              class="absolute top-[270px] left-[150px] scale-[200%]"
            />

        <div
        v-if="pokemonFounded"
          class="absolute right-10 top-[190px] cursor-pointer w-[240px] bg-white rounded-md flex p-2 border-2 border-zinc-500"
         >
        
          <div class="w-full text-[12px]">
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
                class="relative flex w-full justify-between px-1 overflow-hidden"
              >
              <div :style="'width: '+ item + '%'" class="absolute top-0 left-0 h-full bg-gradient-to-r from-red-100 to-red-50 z-0"></div>
                <div class="flex z-10">
                  <div class="font-bold mr-1">{{ toUpper(name) }}:</div>
                  <div>
                    <span class="bold textBig">{{ item }}</span
                    >/100
                  </div>
                </div>
                <div class="w-5 z-10">
                  <img :src="logo(name)" alt="" role="presentation" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="listEvolutions.length > 1" class="absolute bottom-10 right-10 w-[240px]">
        <h4 class="w-full text-center">Outros estágios</h4>
        <div class="flex w-full justify-center gap-1">
          <div
            v-for="(pokemon, index) in listEvolutions"
            :key="index"
                     >
            <div
              class="w-full bg-white rounded-md mx-3 p-1 flex flex-col items-center cursor-pointer border-2 border-black"
              v-if="pokemon.name != pokemonName.toLowerCase()"
              @click=";(pokemonName = pokemon.name), searchPokemon()"
            >
              
                <img :src="pokemon.sprites.versions['generation-v']['black-white'].animated.front_default" alt="Pokemon Image" class="max-h-[40px] scale-150"/>
             
              <div class="mt-2">{{ toUpper(pokemon.name) }}</div>
            </div>
            
          </div>
        </div>
      </div>
      </div>
     


</template>

<style scoped>

.img {
  background-image: url('../assets/pokedex.png');
  background-size: cover;
  background-position: center;
}
</style>
