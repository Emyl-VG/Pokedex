let currentPokemonId = null;
const MAX_POKEMON = 151;
document.addEventListener('DOMContentLoaded', () => {
    
    const pokemonId = new URLSearchParams(window.location.search).get("id");
    const id = parseInt(pokemonId, 10);

    if (id < 1 || id > MAX_POKEMON) {
        return (window.location.href = "./index.html");
    }

    currentPokemonId = id;
    loadPokemon(id);
});

async function loadPokemon(id) {
    try {
        const [pokemon, pokemonSpecies] = await Promise.all([fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then((res) => res.json()),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
            .then((res) => res.json()),
        ]);

        const abilitiesWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.ability");
        abilitiesWrapper.innerHTML = "";
        if (currentPokemonId === id) {
            displayPokemonDetails(pokemon)
            const flavorText = getEnglishFlavorText(pokemonSpecies);
            document.querySelector(".body3-fonts.pokemon-description").textContent = flavorText

            const [leftArrow, rightArrow] = ["#leftArrow", "#rightArrow"].map((sel) => document.querySelector(sel));
            leftArrow.removeEventListener("click", navigatePokemon);
            rightArrow.removeEventListener("click", navigatePokemon);

            if (id !== 1) {
                leftArrow.addEventListener("click", () => {
                    navigatePokemon(id - 1)
                })
            }

            if (id !== MAX_POKEMON) {
                rightArrow.addEventListener("click", () => {
                    navigatePokemon(id + 1)
                })
            }

            window.history.pushState({}, "", `./details.html?id=${id}`);
        }

        return true;
    }
    catch (error) {
        console.log("Error while fetching Pokemon Data:", error);
        return false;
    }
}

async function navigatePokemon(id) {
    currentPokemonId = id;
    await loadPokemon(id);
}

const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890f0",
    electric: "#F8D030",
    grass: "#78c850",
    ice: "#98D8D8",
    fighting: "#c03028",
    poison: "#a040a0",
    ground: "#e0c068",
    flying: "#a890f0",
    psychic: "#f85888",
    bug: "#a8b820",
    rock: "#b8a038",
    ghost: "#705898",
    dragon: "#7038f8",
    dark: "#705848",
    steel: "#b8b8d0",
    fairy: "#ee99ac",
}

function setElementStyles(elements, cssProperty, value) {
    elements.forEach((element) => {
        element.style[cssProperty] = value;
    });
}

function rgbafromHex(hexColor) {
    return [parseInt(hexColor.slice(1, 3), 16),
    parseInt(hexColor.slice(1, 3), 16),
    parseInt(hexColor.slice(1, 3), 16)]
        .join(", ");
}

function setTypeBackgroundColour(pokemon) {
    const mainType = pokemon.types[0].type.name;
    const color = typeColors[mainType];
    
    if(pokemon.types.hasOwnProperty(1)){
        console.log("Subtype Present");
        const subType= pokemon.types[1].type.name;
        const subTypeColor = typeColors[subType];    
       console.log(subTypeColor);
       setElementStyles(
        document.querySelectorAll(".power-wrapper > p:nth-child(2)"), "backgroundColor", subTypeColor
    );

    }

    if (!color) {
        console.warn(`Color not defines for type: ${mainType}`);
        return;
    }

    const detailMainElement = document.querySelector(".detail-main");
    setElementStyles([detailMainElement], "backgroundColor", color);
    setElementStyles([detailMainElement], "borderColor", color)
    setElementStyles(
        document.querySelectorAll(".power-wrapper > p:nth-child(1)"), "backgroundColor", color
    );
    setElementStyles(
        document.querySelectorAll(".stats-wrap p.stats"), "color", color
    );
    setElementStyles(
        document.querySelectorAll(".stats-wrap .progress-bar"), "color", color
    );

    const rgbaColor = rgbafromHex(color);
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
    .stats-wrap .progress-bar::-webkit-progress-bar{
        background-color:rgba(${rgbaColor},0.5)
    }
    .stats-wrap .progress-bar::-webkit-progress-value{
        background-color:rgba(${color})
    }`;

    document.head.appendChild(styleTag);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function createAndAppendElement(parent, tag, options = {}) {
    const element = document.createElement(tag);
    Object.keys(options).forEach((key) => {
        element[key] = options[key]
    });
    parent.appendChild(element);
    return element;
}

function displayPokemonDetails(pokemon) {
    const { name, id, types, weight, height, abilities, stats } = pokemon;
    const capitalizePokemonName = capitalizeFirstLetter(name);

    document.querySelector("title").textContent = capitalizePokemonName;

    const detailMainElement = document.querySelector(".detail-main");
    detailMainElement.classList.add(name.toLowerCase());

    document.querySelector(".name-wrap .name").textContent = capitalizePokemonName;

    document.querySelector(".pokemon-id-wrap .body2-fonts").textContent = `#${String(id).padStart(3, "0")}`;

    const imageElement = document.querySelector(".detail-img-wrapper img");
    imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`
    imageElement.alt=name;

    const typeWrapper = document.querySelector(".power-wrapper");
    typeWrapper.innerHTML = "";
    types.forEach(({ type }) => {
        createAndAppendElement(typeWrapper, "p", {
            className: `body3-fonts type ${type.name}`,
            textContent: type.name,
        });
    })

    document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight").textContent = `${weight / 10} kg`;
    document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.height").textContent = `${height / 10} m`;

    const abilitiesWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.ability");
    abilities.forEach(({ ability }) => {
        createAndAppendElement(abilitiesWrapper, "p", {
            className: "body3-fonts",
            textContent: capitalizeFirstLetter(ability.name),
        });
    });

    const statsWrapper = document.querySelector(".stats-wrapper");
    statsWrapper.innerHTML = "";

    const statNameMapping = {
        hp: "HP",
        attack: "ATK",
        defense: "DEF",
        "special-attack": "SATK",
        "special-defense": "SDEF",
        speed: "SPD",
    };

    stats.forEach(({ stat, base_stat }) => {
        const statDiv = document.createElement("div");
        statDiv.className = "stats-wrap";
        statsWrapper.appendChild(statDiv);

        createAndAppendElement(statDiv, "p", {
            className: "body3-fonts stats",
            textContent: statNameMapping[stat.name],
        });
        createAndAppendElement(statDiv, "p", {
            className: "body3-fonts",
            textContent: String(base_stat).padStart(3, "0"),
        });
        createAndAppendElement(statDiv, "progress", {
            className: "progress-bar",
            value: base_stat,
            max: 100,

        });
    })

    setTypeBackgroundColour(pokemon);

}


function getEnglishFlavorText(pokemonSpecies){
    for(let entry of pokemonSpecies.flavor_text_entries){
        if(entry.language.name==="en"){
            let flavor=entry.flavor_text.replace(/\f/g,"");
            return flavor;
        }
    }
    return "";
}
