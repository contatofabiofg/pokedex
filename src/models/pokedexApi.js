import axios from "axios";

const api = axios.create({
  baseURL: "https://pokeapi.co/api/v2/",
});

function onError(error) {
  console.log(
    "Sorry! I cant get the list of Pokemons! Error: " + error
  );
}

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return onError(error);
  }
);

export default {
  api,
};
