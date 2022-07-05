const apiURL = "https://api.openbrewerydb.org/breweries";
const breweriesUL = document.querySelector("#breweries-list");
const stateForm = document.querySelector("#select-state-form");
const typeFilter = document.querySelector("#filter-by-type");

const state = {
  allowedBreweryTypes: ["micro", "brewpub", "regional"],
  usState: "",
  breweries: [],
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

  state.breweries.forEach((brewery) => {
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
  fetch(apiURL)
    .then((res) => res.json())
    .then((breweries) => {
      setState({ breweries: getAllowedBreweriesByType(breweries) });
      render();
    });
}

function render() {
  renderBreweries();
}

stateForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const thisUSState = e.target[0].value.split(" ").join("_");

  if (!thisUSState) {
    init();
  } else {
    console.log(thisUSState);
    setState({ usState: thisUSState });

    fetch(`${apiURL}?by_state=${state.usState}&per_page=20`)
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

  if (!thisType) {
    init();
  } else {
    fetch(`${apiURL}?by_type=${thisType}&per_page=20`)
      .then((res) => res.json())
      .then((breweries) => {
        setState({ breweries: breweries });
        render();
      });
  }
});

init();
