let pokemonList = document.getElementById("uniquePokemonList");
let searchInput = document.getElementById("search");
let loadingScreen = document.getElementById("loading");
let limit = 20;
let alreadyLoadedPokemon = [];
let currentPokemonIndex = -1;

async function fetchPokemon() {
  try {
    let API_URL = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`;
    loadingScreen.classList.remove("hidden");
    let response = await fetch(API_URL);
    let pokemonData = await response.json();

    for (let i = 0; i < pokemonData.results.length; i++) {
      let pokemon = pokemonData.results[i];

      if (!alreadyLoadedPokemon.includes(pokemon.name)) {
        alreadyLoadedPokemon.push(pokemon.name);
        console.log("Aktuelle Pokémon-Liste:", alreadyLoadedPokemon);

        let pokemonDetails = await fetch(pokemon.url);
        let pokemonDetailsData = await pokemonDetails.json();

        renderPokemon(pokemonDetailsData, alreadyLoadedPokemon.length);
      }
    }

    loadingScreen.classList.add("hidden");
  } catch (error) {
    showError("Fehler beim Laden der Pokémon-Daten.");
  }
}

function loadMorePokemon() {
  limit += 20;
  fetchPokemon();
}

function renderPokemon(pokemon, index) {
  let types = [];

  for (let j = 0; j < pokemon.types.length; j++) {
    types.push(pokemon.types[j].type.name);
  }

  const typesString = types.join(", ");
  const primaryType = types[0];

  pokemonList.innerHTML += /*html*/ `
                 <div class="pokemon-card ${primaryType}" onclick="showModal(${index}, '${pokemon.name}', '${pokemon.sprites.front_default}', '${typesString}', ${pokemon.height}, ${pokemon.weight}, ${pokemon.stats[1].base_stat}, ${pokemon.stats[2].base_stat})">
                <span class="pokemon-number">#${index}</span>
                <img src="${pokemon.sprites.front_default}">
        <h2>${pokemon.name}</h2>
        <p>${typesString}</p> 
      </div>
        `;
}

function showError(message) {
  pokemonList.innerHTML = `<p>${message}</p>`;
}

function showModal(index, name, image, types, height, weight, attack, defense) {
  currentPokemonIndex = index;
  document.getElementById("pokemonModal").classList.remove("displayNone");
  document.body.style.overflow = "hidden";
  document.getElementById("pokemonDetails").innerHTML = `
    <h2>#${index} - ${name}</h2>
    <img src="${image}" alt="${name}">
    <p>Typ: ${types}</p>
    <p>Höhe: ${height} dm</p>
    <p>Gewicht: ${weight} hg</p>
    <p>Angriff: ${attack}</p>
    <p>Verteidigung: ${defense}</p>
    <span id="prevPokemon" class="arrow left-arrow" onclick="previousPokemon(${index})">&larr;</span>
    <span id="nextPokemon" class="arrow right-arrow" onclick="nextPokemon(${index})">&rarr;</span>
  `;
}

function closeModal() {
  document.getElementById("pokemonModal").classList.add("displayNone");
  document.body.style.overflow = "auto";
}

function previousPokemon() {
  if (currentPokemonIndex > 0) {
    currentPokemonIndex--;
  } else {
    currentPokemonIndex = alreadyLoadedPokemon.length - 1;
  }
  let pokemonName = alreadyLoadedPokemon[currentPokemonIndex];
  fetchPokemonDetails(pokemonName, currentPokemonIndex);
}

function nextPokemon() {
  if (currentPokemonIndex < alreadyLoadedPokemon.length - 1) {
    currentPokemonIndex++;
  } else {
    currentPokemonIndex = 0;
  }
  let pokemonName = alreadyLoadedPokemon[currentPokemonIndex];
  fetchPokemonDetails(pokemonName, currentPokemonIndex);
}

function fetchPokemonDetails(pokemonName, index) {
  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    .then((response) => response.json())
    .then((pokemonDetailsData) => {
      document.getElementById("pokemonDetails").innerHTML = `
        <h2>#${index + 1} - ${pokemonDetailsData.name}</h2>
        <img src="${pokemonDetailsData.sprites.front_default}" alt="${
        pokemonDetailsData.name
      }">
        <p>Typ: ${pokemonDetailsData.types
          .map((type) => type.type.name)
          .join(", ")}</p>
        <p>Höhe: ${pokemonDetailsData.height} dm</p>
        <p>Gewicht: ${pokemonDetailsData.weight} hg</p>
        <p>Angriff: ${pokemonDetailsData.stats[1].base_stat}</p>
        <p>Verteidigung: ${pokemonDetailsData.stats[2].base_stat}</p>
        <span id="prevPokemon" class="arrow left-arrow" onclick="previousPokemon(${index})">&larr;</span>
        <span id="nextPokemon" class="arrow right-arrow" onclick="nextPokemon(${index})">&rarr;</span>
      `;
    })
    .catch((error) => {
      console.error(error);
      alert("Ein Fehler ist aufgetreten: " + error.message);
    });
}

function searchPokemon() {
  let input = searchInput.value.toLowerCase();
  if (input.length === 0 || input.length <= 2) {
    pokemonList.innerHTML = "";
    alreadyLoadedPokemon.forEach((pokemonName, index) => {
      let pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
      fetch(pokemonUrl)
        .then((response) => response.json())
        .then((pokemonDetailsData) => {
          renderPokemon(pokemonDetailsData, index + 1);
        });
    });
  } else {
    let filteredPokemon = alreadyLoadedPokemon.filter((pokemonName) =>
      pokemonName.includes(input)
    );
    pokemonList.innerHTML = "";

    filteredPokemon.forEach((pokemonName, index) => {
      let pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
      fetch(pokemonUrl)
        .then((response) => response.json())
        .then((pokemonDetailsData) => {
          renderPokemon(
            pokemonDetailsData,
            alreadyLoadedPokemon.indexOf(pokemonName) + 1
          );
        });
    });
  }
}

fetchPokemon();
