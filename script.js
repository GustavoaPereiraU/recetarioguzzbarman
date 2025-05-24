// File: script.js

// Variable para almacenar los datos de los cócteles cargados
let allCocktails = [];

const categories = [
  "Gin and Tonic",
  "Autor",
  "Spritz",
  "Clásicos",
  "Mocktails",
  "Jugos y Limonadas"
];

// Mapeo de nombres de categoría a nombres de archivo JSON
const categoryFileMap = {
    "Gin and Tonic": "gin_and_tonic.json",
    "Autor": "autor.json",
    "Spritz": "spritz.json",
    "Clásicos": "clasicos.json",
    "Mocktails": "mocktails.json",
    "Jugos y Limonadas": "jugos_y_limonadas.json"
};


// Función para cargar los datos de todos los archivos JSON de categoría
async function loadCocktails() {
  allCocktails = []; // Limpiar el array por si acaso

  const fetchPromises = categories.map(category => {
    const filename = categoryFileMap[category];
    if (!filename) {
        console.error(`No JSON file mapped for category: ${category}`);
        return Promise.resolve([]); // Retorna un array vacío para esta categoría si no hay mapeo
    }
    return fetch(filename)
      .then(response => {
        if (!response.ok) {
          // Si hay un error HTTP (ej: archivo no encontrado), loguear y retornar array vacío
          console.error(`HTTP error! status: ${response.status} for file: ${filename}`);
          return [];
        }
        return response.json();
      })
      .catch(error => {
        // Capturar errores de red u otros errores de fetch
        console.error(`Error fetching file: ${filename}`, error);
        return []; // Retorna un array vacío en caso de error
      });
  });

  try {
    // Esperar a que todas las promesas de fetch se resuelvan
    const results = await Promise.all(fetchPromises);

    // Concatenar todos los arrays de cócteles cargados
    allCocktails = results.flat(); // flat() aplana el array de arrays en un solo array

    console.log("Cocktails loaded:", allCocktails); // Opcional: verificar en consola
    displayCocktails(); // Mostrar los cócteles una vez cargados
  } catch (error) {
    console.error('Error loading one or more cocktail files:', error);
    // Opcional: Mostrar un mensaje de error en la UI si falla la carga inicial
  }
}


function displayCocktails(filter = "") {
  const container = document.getElementById('cocktailContainer');
  container.innerHTML = '';

  // Asegurarse de que las categorías se muestren en el orden deseado,
  // incluso si una categoría no tiene cócteles después del filtro.
  categories.forEach(category => {
    const filteredCocktails = allCocktails.filter(c =>
      c.category === category && c.name.toLowerCase().includes(filter.toLowerCase())
    );

    // Solo crear la sección de categoría si hay cócteles filtrados para ella
    if (filteredCocktails.length > 0) {
        const categorySection = document.createElement('div');
        categorySection.className = 'category';

        const title = document.createElement('h2');
        title.textContent = category;
        categorySection.appendChild(title);

        const list = document.createElement('div');
        list.className = 'cocktail-list';

        filteredCocktails.forEach(cocktail => {
          const card = document.createElement('div');
          card.className = 'cocktail-card';

          // Create the main content area (name + recipe container)
          const contentDiv = document.createElement('div');
          contentDiv.className = 'cocktail-content';

          const nameElement = document.createElement('h3');
          nameElement.textContent = cocktail.name;
          contentDiv.appendChild(nameElement);

          // Create the recipe container (initially hidden)
          const recipeDiv = document.createElement('div');
          recipeDiv.className = 'cocktail-recipe';
          recipeDiv.style.display = 'none'; // Hide by default

          if (cocktail.recipe) {
              let recipeHTML = '<h4>Receta:</h4>';
              recipeHTML += '<ul class="ingredients-list">';
              cocktail.recipe.ingredients.forEach(ingredient => {
                  recipeHTML += `<li>${ingredient}</li>`;
              });
              recipeHTML += '</ul>';
              recipeHTML += `<p><strong>Decoración:</strong> ${cocktail.recipe.garnish}</p>`;
              recipeHTML += `<p><strong>Vaso:</strong> ${cocktail.recipe.glass}</p>`;
              recipeHTML += `<p><strong>Metodo:</strong> ${cocktail.recipe.method}</p>`;
              recipeHTML += `<p><strong>Hielo:</strong> ${cocktail.recipe.ice}</p>`;
              recipeDiv.innerHTML = recipeHTML;
          } else {
              recipeDiv.innerHTML = '<p>No hay receta disponible.</p>';
          }

          contentDiv.appendChild(recipeDiv);

          // Add image and content to the card
          const imgElement = document.createElement('img');
          imgElement.src = cocktail.image;
          imgElement.alt = cocktail.name;

          card.appendChild(imgElement);
          card.appendChild(contentDiv);


          // Add click event listener to the card
          card.addEventListener('click', () => {
            // Find the recipe div within this specific card
            const currentRecipeDiv = card.querySelector('.cocktail-recipe');

            // Toggle the display of the recipe div
            if (currentRecipeDiv.style.display === 'none') {
              currentRecipeDiv.style.display = 'block';
            } else {
              currentRecipeDiv.style.display = 'none';
            }
          });

          list.appendChild(card);
        });

        categorySection.appendChild(list);
        container.appendChild(categorySection);
    }
  });
}

function filterCocktails() {
  const query = document.getElementById('searchInput').value;
  displayCocktails(query); // Llama a displayCocktails con el filtro
}

// Cargar los cócteles cuando la página esté lista
loadCocktails();
