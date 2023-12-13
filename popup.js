let isRecording = false;
const recognition = new webkitSpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

function updateResultsContainer(message) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `<div>${message}</div>`;
}

function toggleButtons() {
    document.getElementById('start-record-btn').disabled = isRecording;
    document.getElementById('stop-record-btn').disabled = !isRecording;
}

function displayError(message) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `<div class="error">${message}</div>`;
}

document.getElementById('start-record-btn').addEventListener('click', () => {
    if (!isRecording) {
        recognition.start();
        isRecording = true;
        toggleButtons();
        updateResultsContainer("Speech Recognition started...");
    }
});

document.getElementById('stop-record-btn').addEventListener('click', () => {
    if (isRecording) {
        recognition.stop();
        isRecording = false;
        toggleButtons();
        updateResultsContainer("Stopping speech recognition...");
    }
});

recognition.onresult = async (event) => {
    try {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Transcript:", transcript);  // Log the transcript
        updateResultsContainer(`Transcript received: "${transcript}"`);
        updateResultsContainer("Identifying Entities...");

        const ingredients = await identifyIngredients(transcript);
        const { identifiedContinents, identifiedSubRegions } = identifyContinentsAndSubRegions(transcript);
        

        console.log("Identified Continents:", identifiedContinents);
        console.log("Identified Sub-Regions:", identifiedSubRegions);
        console.log("Identified Ingredients:", ingredients);

        if (ingredients.length > 0 || identifiedContinents.length > 0 || identifiedSubRegions.length > 0) {
            updateResultsContainer("Entities Identified");
            fetchAndDisplayRecipes(ingredients, identifiedContinents, identifiedSubRegions);
        } else {
            updateResultsContainer("No relevant categories identified. Please try again.");
        }
    } catch (error) {
        console.error('Error:', error);
        updateResultsContainer("An error occurred. Please try again.");
    }
};




recognition.onend = () => {
    isRecording = false;
    toggleButtons();
    updateResultsContainer("Speech Recognition finished");
};

recognition.onerror = (event) => {
    displayError(event.error);
};
// Mock data for continents and sub-regions (replace with your actual text file data)
const continents = ['African', 'Asian', 'Australasian', 'European', 'Latin American', 'North American'];

const ethnicities = [
    'Egyptian', 'Libyan', 'Moroccan', 'Angolan', 'Ethiopian', 'Namibian', 'Nigerian', 'Somalian', 'Sudanese',
    'Chinese', 'Mongolian', 'Bangladeshi', 'Indian', 'Nepalese', 'Pakistani', 'Japanese', 'Korean', 'Iraqi',
    'Israeli', 'Laotian', 'Lebanese', 'Palestinian', 'Saudi Arabian', 'Turkish', 'Cambodian',
    'Filipino', 'Indonesian', 'Malaysian', 'Vietnamese', 'Thai',
    'Australian', 'New Zealander',
    'Belgian', 'Dutch', 'Austrian', 'German', 'Swiss', 'Czech', 'Hungarian', 'Polish',
    'Russian', 'French', 'Greek', 'Irish', 'Italian', 'Danish', 'Finnish', 'Icelandic', 'Norwegian', 'Swedish',
    'Portuguese', 'Spanish', 'English', 'Scottish', 'UK', 'Welsh',
    'Cuban', 'Jamaican', 'Puerto Rican', 'Rest Caribbean',
    'Costa Rican', 'Guatemalan', 'Honduran', 'Mexican', 'Argentine', 'Brazilian', 'Chilean', 'Colombian', 'Ecuadorean',
    'Peruvian', 'Venezuelan', 'Canadian', 'US'
]


// Utility function to create a mapping from lower case to original case
function createLowerCaseMapping(list) {
    const mapping = {};
    list.forEach(item => {
        mapping[item.toLowerCase()] = item;
    });
    return mapping;
}

// Create mappings for continents, subRegions, and ethnicities
const continentMapping = createLowerCaseMapping(continents);
const ethnicityMapping = createLowerCaseMapping(ethnicities);

function identifyContinentsAndSubRegions(transcript) {
    const words = transcript.split(/\s+/);
    const identifiedContinents = words.filter(word => continentMapping[word]).map(word => continentMapping[word]);
    const identifiedSubRegions = words.filter(word => ethnicityMapping[word]).map(word => ethnicityMapping[word]);
    return { identifiedContinents, identifiedSubRegions };
}

async function identifyIngredients(transcript) {
    try {
        const { identifiedContinents, identifiedSubRegions } = identifyContinentsAndSubRegions(transcript);
        if (identifiedContinents.length > 0 || identifiedSubRegions.length > 0) {
            // If continents or sub-regions are identified, remove them from the transcript
            const cleanedTranscript = transcript
                .split(/\s+/)
                .filter(word => !continentMapping[word] && !ethnicityMapping[word])
                .join(' ');
            // Attempt to extract ingredients from the cleaned transcript
            const ingredients = await extractIngredientsFromTranscript(cleanedTranscript);
            if (Array.isArray(ingredients) && ingredients.length > 0) {
                return ingredients;
            }
        } else {
            // If no continents or sub-regions are identified, attempt to extract ingredients directly
            const ingredients = await extractIngredientsFromTranscript(transcript);
            if (Array.isArray(ingredients) && ingredients.length > 0) {
                return ingredients;
            }
        }
        return [];
    } catch (error) {
        console.error('Transcript:', transcript);
        console.error('Error:', error);
        return [];
    }
}

async function extractIngredientsFromTranscript(transcript) {
    const huggingFaceApiUrl = "https://api-inference.huggingface.co/models/Dizex/InstaFoodRoBERTa-NER";
    const data = { 'inputs': transcript };

    try {
        const response = await fetch(huggingFaceApiUrl, {
            headers: {
                'Authorization': 'Bearer xxxx' // Replace with your actual Hugging Face API key
            },
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error("Hugging Face API response error: ", response.status, response.statusText);
            response.text().then(text => {
                console.error("Hugging Face API error body:", text);
            });
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Hugging Face API response:", result);
        const ingredients = result.map(entity => entity.word.trim());
        if (ingredients.length === 0) {
            throw new Error('No ingredients found.');
        }

        return ingredients;
    } catch (error) {
        console.error('Transcript:', transcript);
        console.error('Error querying Hugging Face API:', error);
        displayError('Failed to extract ingredients. Please try again.');
        return [];
    }
}

// Utility function to perform API calls
async function fetchRecipesFromAPI(apiURL) {
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa('xxxx' + ':' + 'xxxx'));

    const response = await fetch(apiURL, { method: 'GET', headers });
    if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
    return await response.json();
}



async function addRecipesToSet(apiURL, recipesSet) {
    try {
        const recipes = await fetchRecipesFromAPI(apiURL);
        console.log("Fetched Recipes:", recipes); 
        recipes.forEach(recipe => recipesSet.add([recipe.recipe_title, recipe.url])); 
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}


async function fetchAndDisplayRecipes(ingredients, continents, subRegions) {
    updateResultsContainer("Fetching Recipes...");

    let ingredientsList = [];
    let continentsList = [];
    let subRegionsList = [];

    if (ingredients.length > 0) {
        ingredientsList = await fetchRecipesList(`https://cosylab.iiitd.edu.in/rdbapi/recipeDB/searchRecipeByIngUsed/${ingredients.join(',')}`);
    }

    if (continents.length > 0) {
        continentsList = await fetchRecipesList(`https://cosylab.iiitd.edu.in/rdbapi/recipeDB/search_continent/${continents.join(',')}`);
    }

    if (subRegions.length > 0) {
        subRegionsList = await fetchRecipesList(`https://cosylab.iiitd.edu.in/rdbapi/recipeDB/search_subregion/${subRegions.join(',')}`);
    }

    let finalList = [];
    let lists = [ingredientsList, continentsList, subRegionsList].filter(list => list.length > 0);

    if (lists.length === 0) {
        updateResultsContainer("No recipes found.");
        return;
    }

    // Find common recipes
    finalList = lists.shift().filter(pair => lists.every(list => list.some(item => item[0] === pair[0])));

    // Display up to 10 recipes
    const recipeLinks = finalList.slice(0, 10).map(([title, url]) => 
        `<a href="${url}" target="_blank">${title}</a>`
    ).join('<br>');

    if (recipeLinks.length === 0) {
        updateResultsContainer("No common recipes found.");
    } else {
        updateResultsContainer(`<div>${recipeLinks}</div>`);
    }
}

async function fetchRecipesList(apiURL) {
    try {
        const recipes = await fetchRecipesFromAPI(apiURL);
        return recipes.map(recipe => [recipe.recipe_title, recipe.url]);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return [];
    }
}
