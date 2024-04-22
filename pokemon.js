const MAX_POKEMON = 151;
const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const notFoundMessage = document.querySelector("#not-found-message");
const closeButton = document.querySelector(".search-close-icon")


let allPokemons = [];
fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
.then((response)=> response.json())
.then((data)=>{
    allPokemons=data.results;
    console.log(data)
    displayPokemons(allPokemons);
});

async function fetchPokemonDataBeforeRedirect(id){
    try{
        const[pokemon, pokemonSpecies]= await Promise.all([fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res)=>res.json()),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res)=>res.json()),
    ]);
    return true;
    }catch(error){
        console.log("Failed to retrive Pokemon Data before redirect")
    }
}

function displayPokemons(pokemons){
    listWrapper.innerHTML="";

    pokemons.forEach((pokemon)=>{
        const pokemonId= pokemon.url.split("/")[6];
        const listitem= document.createElement("div");
        listitem.className="list-item";
        listitem.innerHTML=`
        <div class="number-wrap">
            <p class="caption-fonts">#${pokemonId}</p>
        </div>
        <div class="img-wrap">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonId}.svg" alt="${pokemon.name}" />
        </div>
        <div class="name-wrap">
            <p class="body3-fonts">${pokemon.name}</p>
        </div>
        `;

        listitem.addEventListener("click", async ()=>{
            const success= await fetchPokemonDataBeforeRedirect(pokemonId);
            if(success){
                window.location.href= `./detail.html?id=${pokemonId}`;
            }
        })
        listWrapper.appendChild(listitem);
    });
}

searchInput.addEventListener("keyup", handleSearch);

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  let filteredPokemons;

  if (numberFilter.checked) {
    filteredPokemons = allPokemons.filter((pokemon) => {
      const pokemonID = pokemon.url.split("/")[6];
      return pokemonID.startsWith(searchTerm);
    });
  } else if (nameFilter.checked) {
    filteredPokemons = allPokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().startsWith(searchTerm)
    );
  } else {
    filteredPokemons = allPokemons;
  }

  displayPokemons(filteredPokemons);

  if (filteredPokemons.length === 0) {
    notFoundMessage.style.display = "block";
  } else {
    notFoundMessage.style.display = "none";
  }
}

closeButton.addEventListener("click", closeSearch);

function closeSearch(){
    searchInput.value="";
    displayPokemons(allPokemons);
    notFoundMessage.style.display="none";
}