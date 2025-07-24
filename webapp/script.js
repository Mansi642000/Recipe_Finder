/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 

function searchRecipes() {
    const searchInput = document.getElementById('searchInput').value;
    const recipesDiv = document.getElementById('recipes');
    const notFoundDiv = document.getElementById('notFound');

    // Clear previous search results
    recipesDiv.innerHTML = '';
    notFoundDiv.style.display = 'none';

    // Check if input is empty
    if (searchInput.trim()=== '') {
        notFoundDiv.innerHTML = "Please enter a recipe name!";
        notFoundDiv.style.display = "block";
        return;
    }

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInput}`)
        .then(response => response.json())
        .then(data => {
            if (!data.meals) {
                notFoundDiv.innerHTML = "Recipe not found, try again another search!";
                notFoundDiv.style.display = "block";
            } else {
                data.meals.forEach(meal => {
                    const card = document.createElement("div");
                    card.classList.add("recipe-card");
                    card.innerHTML = `
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                        <h3>${meal.strMeal}</h3>
                        <a href="${meal.strYoutube}" target="_blank">Watch Recipe</a>
                        <button onclick="viewRecipe('${meal.idMeal}')">View Recipe</button>
                            `;
                    recipesDiv.appendChild(card);
                });
            }
        });
        
}

// Optional: Function to handle "View Recipe" button click
function viewRecipe(mealId) {
    const popupCard = document.getElementById('popupCard');
    const recipeTitle= document.getElementById('recipeTitle');
    const recipeDetails=document.getElementById('recipeDetails');
    
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
            .then(response => response.json())
            .then(data => {
                if(!data.meals || data.meals.length === 0){
                  console.error("No meal found for ID:", mealId);
                  recipeTitle.innerText = "Recipe Not Found";
                   recipeDetails.innerText = "Details are unavailable.";
                    return;  
                }
                const meal =data.meals[0];
           recipeTitle.innerText=meal.strMeal;
           let ingredients = "";
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== "") {
                    ingredients += `<li>${measure ? measure + " " : ""}${ingredient}</li>`;
                }
            }

            // Combine ingredients and instructions
            recipeDetails.innerHTML = `
                <h3>Ingredients:</h3>
                <ul>${ingredients}</ul>
                <h3>Instructions:</h3>
                <p>${meal.strInstructions || "Instructions not available."}</p>
            `;
        
           popupCard.style.display='block';
    })
    .catch(error => console.error("Error fetching recipe details:", error));
}

function closeRecipe(){
   const popupCard = document.getElementById('popupCard');
    if (popupCard) {
        popupCard.style.display = 'none';
    } else {
        console.error("Popup card not found!");
    }   
}

function showMessage(message, type) {
    const messageBox = document.getElementById("messageBox");
    messageBox.innerText = message;
    messageBox.className = `message ${type}`;
    messageBox.style.display = "block";

    setTimeout(() => {
        messageBox.style.display = "none";
    }, 3000);
}


// Display saved recipes when the page loads
//document.addEventListener("DOMContentLoaded", viewSavedRecipes);

document.addEventListener("DOMContentLoaded", ()=>{
  viewSavedRecipes();
  const savedRecipeContainer = document.getElementById("savedRecipeContainer");
  savedRecipeContainer.style.display = "none";
});
*/
function searchRecipes() {
    const searchInput = document.getElementById('searchInput').value;
    const recipesDiv = document.getElementById('recipes');
    const notFoundDiv = document.getElementById('notFound');

    recipesDiv.innerHTML = '';
    notFoundDiv.style.display = 'none';

    if (searchInput.trim() === '') {
        notFoundDiv.innerHTML = "Please enter a recipe name or ingredient!";
        notFoundDiv.style.display = "block";
        return;
    }

    // Ingredient search
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInput}`)
        .then(response => response.json())
        .then(data => {
            if (data.meals && data.meals.length > 0) {
                // Ingredient Search Successful, Process Primary Recipes
                processMeals(data.meals, recipesDiv, "Primary Recipes");

                // Fetch Relatable Recipes
                fetch(`https://www.themealdb.com/api/json/v1/1/search.php?i=${searchInput}`)
                    .then(response => response.json())
                    .then(relatableData => {
                        if (relatableData.meals && relatableData.meals.length > 0) {
                            processMeals(relatableData.meals, recipesDiv, "Related Recipes");
                        }
                    })
                    .catch(error => handleFetchError("Relatable Recipes", error));

            } else {
                // Ingredient Search Failed, Try Recipe Name Search
                fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInput}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.meals && data.meals.length > 0) {
                            processMeals(data.meals, recipesDiv, "Results");
                        } else {
                            notFoundDiv.innerHTML = "No recipes found.";
                            notFoundDiv.style.display = "block";
                        }
                    })
                    .catch(error => handleFetchError("Recipe Name Search", error));
            }
        })
        .catch(error => handleFetchError("Ingredient Search", error));
}

function processMeals(meals, recipesDiv, sectionTitle) {
    if (meals.length > 0) {
        const sectionHeader = document.createElement("h2");
        sectionHeader.textContent = sectionTitle;
        recipesDiv.appendChild(sectionHeader);
    }

    meals.forEach(meal => {
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
            .then(response => response.json())
            .then(mealData => {
                if (mealData.meals) {
                    const mealDetails = mealData.meals[0];
                    const card = document.createElement("div");
                    card.classList.add("recipe-card");
                    card.innerHTML = `
                        <img src="${mealDetails.strMealThumb}" alt="${mealDetails.strMeal}">
                        <h3>${mealDetails.strMeal}</h3>
                        <a href="${mealDetails.strYoutube}" target="_blank">Watch Recipe</a>
                        <button onclick="viewRecipe('${mealDetails.idMeal}')">View Recipe</button>
                    `;
                    recipesDiv.appendChild(card);
                }
            })
            .catch(error => handleFetchError("Meal Details", error));
    });
}

function handleFetchError(searchType, error) {
    console.error(`Error in ${searchType}:`, error);
    const notFoundDiv = document.getElementById('notFound');
    notFoundDiv.innerHTML = "An error occurred during the search.";
    notFoundDiv.style.display = 'block';
}

function viewRecipe(mealId) {
    const popupCard = document.getElementById('popupCard');
    const recipeTitle = document.getElementById('recipeTitle');
    const recipeDetails = document.getElementById('recipeDetails');

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
        .then(response => response.json())
        .then(data => {
            if (!data.meals || data.meals.length === 0) {
                console.error("No meal found for ID:", mealId);
                recipeTitle.innerText = "Recipe Not Found";
                recipeDetails.innerText = "Details are unavailable.";
                return;
            }
            const meal = data.meals[0];
            recipeTitle.innerText = meal.strMeal;
            let ingredients = "";
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== "") {
                    ingredients += `<li>${measure ? measure + " " : ""}${ingredient}</li>`;
                }
            }

            // Combine ingredients and instructions
            recipeDetails.innerHTML = `
                <h3>Ingredients:</h3>
                <ul>${ingredients}</ul>
                <h3>Instructions:</h3>
                <p>${meal.strInstructions || "Instructions not available."}</p>
            `;

            popupCard.style.display = 'block';
        })
        .catch(error => console.error("Error fetching recipe details:", error));
}

function closeRecipe() {
    const popupCard = document.getElementById('popupCard');
    if (popupCard) {
        popupCard.style.display = 'none';
    } else {
        console.error("Popup card not found!");
    }
}

function showMessage(message, type) {
    const messageBox = document.getElementById("messageBox");
    messageBox.innerText = message;
    messageBox.className = `message ${type}`;
    messageBox.style.display = "block";

    setTimeout(() => {
        messageBox.style.display = "none";
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    // viewSavedRecipes(); // Removed, as save functionality is gone.
    const savedRecipeContainer = document.getElementById("savedRecipeContainer");
    if (savedRecipeContainer) {
        savedRecipeContainer.style.display = "none";
    }
});