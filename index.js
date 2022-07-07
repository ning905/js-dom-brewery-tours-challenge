const apiURL = "https://api.openbrewerydb.org/breweries";
const breweriesUL = document.querySelector("#breweries-list");
const searchByStateForm = document.querySelector("#select-state-form");
const typeFilter = document.querySelector("#filter-by-type");

const state = {
  allowedBreweryTypes: ["micro", "brewpub", "regional"],
  usState: "",
  breweries: [],
  filter: { cities: [], type: "" },
  citiesCheckBoxList: [],
  pages: "",
  currentPage: 1,
  numberPerPage: 10,
};

function setState(newState) {
  Object.keys(newState).forEach((prop) => {
    state[prop] = newState[prop];
  });
}

function renderBrewery(brewery) {
  const LI = document.createElement("li");

  const liHeading = document.createElement("h2");
  liHeading.innerText = brewery.name;

  const typeDiv = document.createElement("div");
  typeDiv.classList.add("type");
  typeDiv.innerText = brewery.brewery_type;

  const addressSection = document.createElement("section");
  addressSection.classList.add("address");

  const addressH3 = document.createElement("h3");
  addressH3.innerText = "Address:";
  const streetAddress = document.createElement("p");
  streetAddress.innerText = brewery.street;
  const cityAddress = document.createElement("p");
  cityAddress.innerHTML = `<strong>${brewery.city}, ${brewery.postal_code}</strong>`;

  addressSection.append(addressH3, streetAddress, cityAddress);

  const phoneSection = document.createElement("section");
  phoneSection.classList.add("phone");
  const phoneH3 = document.createElement("h3");
  phoneH3.innerText = "Phone:";
  const phoneNumber = document.createElement("p");
  phoneNumber.innerText = brewery.phone;

  phoneSection.append(phoneH3, phoneNumber);

  const linkSection = document.createElement("section");
  linkSection.classList.add("link");
  const linkTag = document.createElement("a");
  linkTag.innerText = "Visit Website";
  linkTag.href = brewery.website_url;
  linkTag.target = "_blank";
  linkSection.append(linkTag);

  LI.append(liHeading, typeDiv, addressSection, phoneSection, linkSection);

  breweriesUL.append(LI);
}

function renderBreweries() {
  breweriesUL.innerHTML = "";

  let breweriesToRender = state.breweries.filter((brewery) =>
    state.filter.cities.includes(brewery.city)
  );

  if (state.filter.type) {
    breweriesToRender = breweriesToRender.filter(
      (brewery) => brewery.brewery_type === state.filter.type
    );
  }

  state.pages = Math.ceil(breweriesToRender.length / state.numberPerPage);
  console.log("total pages: " + state.pages);
  console.log("current page: " + state.currentPage);

  const trimStart = (state.currentPage - 1) * state.numberPerPage;
  const trimEnd = trimStart + state.numberPerPage;
  const breweriesOnThisPage = breweriesToRender.slice(trimStart, trimEnd);

  breweriesOnThisPage.forEach((brewery) => {
    renderBrewery(brewery);
  });
}

function getAllowedBreweriesByType(breweries) {
  const allowedBreweries = breweries.filter((brewery) =>
    state.allowedBreweryTypes.includes(brewery.brewery_type)
  );

  return allowedBreweries;
}

function init() {
  fetch(`${apiURL}?per_page=500`)
    .then((res) => res.json())
    .then((breweries) => {
      setState({ breweries: getAllowedBreweriesByType(breweries) });
      render();
    });
}

searchByStateForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const thisUSState = e.target[0].value.split(" ").join("_");

  if (!thisUSState) {
    init();
  } else {
    console.log(thisUSState);
    setState({ usState: thisUSState });

    fetch(`${apiURL}?by_state=${state.usState}&per_page=500`)
      .then((res) => res.json())
      .then((breweries) => {
        setState({ breweries: getAllowedBreweriesByType(breweries) });
        render();
      });
  }
});

typeFilter.addEventListener("change", () => {
  const thisType = typeFilter.value;
  console.log(thisType);

  state.filter.type = thisType;

  renderBreweries();
  renderButtons();
});

init();

// Extension 1
/*
const breweriesListHeading = document.querySelector("h1");

function renderSearchBar() {
  const header = document.createElement("header");
  header.classList.add("search-bar");

  const form = document.createElement("form");
  form.id = "search-breweries-form";
  form.autocomplete = "off";
  header.append(form);

  const label = document.createElement("label");
  label.for = "search-breweries";
  const labelContent = document.createElement("h2");
  labelContent.innerText = "Search breweries:";
  label.append(labelContent);

  const input = document.createElement("input");
  input.id = "search-breweries";
  input.name = "search-breweries";
  input.type = "text";

  form.append(label, input);

  breweriesListHeading.after(header);
}
*/

const searchByNameForm = document.querySelector("#search-breweries-form");

searchByNameForm.addEventListener("input", (e) => {
  const input = e.target.value;

  if (!input) {
    init();
  } else {
    fetch(`${apiURL}?by_name=${input}&per_page=500`)
      .then((res) => res.json())
      .then((breweries) => {
        setState({ breweries: getAllowedBreweriesByType(breweries) });
        render();
      });
  }
});

// Extension 2
const cityFilterForm = document.querySelector("#filter-by-city-form");
const clearAllBtn = document.querySelector(".clear-all-btn");

clearAllBtn.style.cursor = "pointer";
clearAllBtn.addEventListener("click", () => {
  setState({ citiesCheckBoxList: [] });
  render();
});

function getCityCheckBoxList() {
  state.citiesCheckBoxList = [];
  state.breweries.forEach((brewery) => {
    if (!state.citiesCheckBoxList.includes(brewery.city)) {
      state.citiesCheckBoxList.push(brewery.city);
    }
  });
  state.filter.cities = state.citiesCheckBoxList;
}

function updateCheckedCities(checkbox, selected) {
  if (checkbox.checked) {
    state.filter.cities.push(selected);
  } else {
    state.filter.cities = state.filter.cities.filter(
      (city) => city !== selected
    );
  }
}

function renderCityCheckbox(city) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = city;
  checkbox.value = city;
  checkbox.checked = state.filter.cities.includes(city);

  const label = document.createElement("label");
  label.for = city;
  label.innerText = city;

  cityFilterForm.append(checkbox, label);

  checkbox.addEventListener("change", (e) => {
    const thisCity = e.target.value;

    updateCheckedCities(checkbox, thisCity);

    renderBreweries();
    renderButtons();
  });

  label.addEventListener("dblclick", (e) => {
    const thisCity = e.target.for;
    checkbox.checked = !checkbox.checked;

    updateCheckedCities(checkbox, thisCity);

    renderBreweries();
  });
}

function renderCityBoxList() {
  cityFilterForm.innerHTML = "";

  getCityCheckBoxList();

  state.citiesCheckBoxList.forEach((city) => {
    renderCityCheckbox(city);
  });
}

//extension 3
const container = document.querySelector("#breweries-list-container");
const buttonContainer = document.createElement("div");
buttonContainer.classList.add("btn-container");

function createPreviousBtn() {
  const previous = document.createElement("button");
  previous.classList.add("page-btn");
  previous.innerText = "Previous";

  previous.addEventListener("click", () => {
    state.currentPage--;

    renderBreweries();
    renderButtons();
  });

  return previous;
}

function createNextBtn() {
  const next = document.createElement("button");
  next.classList.add("page-btn");
  next.innerText = "Next";

  next.addEventListener("click", () => {
    state.currentPage++;

    renderBreweries();
    renderButtons();
  });

  return next;
}

function createCurrentPage() {
  const currentPage = document.createElement("p");
  currentPage.innerText = state.currentPage;

  return currentPage;
}

function renderButtons() {
  buttonContainer.innerHTML = "";
  container.append(buttonContainer);

  const currentPage = createCurrentPage();
  const previous = createPreviousBtn();
  const next = createNextBtn();

  if (state.pages > 1) {
    buttonContainer.append(currentPage, next);

    if (state.currentPage > 1) {
      buttonContainer.insertBefore(previous, buttonContainer.children[0]);

      if (state.currentPage === state.pages) {
        buttonContainer.removeChild(next);
      }
    }
  }
}

function render() {
  renderCityBoxList();
  renderBreweries();
  renderButtons();
}
