function generateRandomId() {
  return faker.datatype.uuid();
}

function generateFullName() {
  return faker.name.findName();
}

function generateAddress() {
  const city = faker.address.city();
  const street = faker.address.streetName();
  const houseNumber = faker.address.streetAddress();

  return   fullAddress = `${city}, ${street}, ${houseNumber}`;

}

function generatePhoneNumber() {
  return faker.phone.phoneNumberFormat();
}

const errorSlider = document.getElementById('errorSlider');
const errorInput = document.getElementById('errorInput');
const seedInput = document.getElementById('seedInput');
const randomSeedButton = document.getElementById('randomSeedButton');
errorInput.addEventListener('change', function () {
  const inputValue = errorInput.value;
  generateErrorsInExistingData();
});

errorSlider.addEventListener('input', function () {
  errorInput.value = errorSlider.value;

  generateErrorsInExistingData();
});

randomSeedButton.addEventListener('click', function () {
  seedInput.value = Math.floor(Math.random() * 1001);
  const inputEvent = new Event('change', { bubbles: true });
  seedInput.dispatchEvent(inputEvent);

});

seedInput.addEventListener('change', function () {
  currentSeed = seedInput.value;
  allData = [];
  currentDataPage = 1;
  loadMoreData();
});

let currentRegion = 'USA';
let currentSeed = localStorage.getItem('fakeDataGeneratorSeed') || 0;

// If the seed is not set in localStorage, set it to 0
if (!localStorage.getItem('fakeDataGeneratorSeed')) {
  localStorage.setItem('fakeDataGeneratorSeed', currentSeed.toString());
}

function setLocaleByRegion(region) {
  switch (region) {
    case 'USA':
      faker.locale = 'en_US';
      break;
    case 'France':
      faker.locale = 'fr';
      break;
    case 'Poland':
      faker.locale = 'pl';
      break;
  }
}

function generateErrors(numErrors, seed) {
  const fakerInstance = faker;
  const errors = [];
  for (let i = 0; i < numErrors; i++) {
    const errorType = faker.datatype.number(3);

    switch (errorType) {
      case 0:
        const deleteIndex = fakerInstance.datatype.number(Number(seed));
        errors.push({ type: 'delete', index: deleteIndex });
        break;
      case 1:
        const insertIndex = fakerInstance.datatype.number(seed.length + 1);
        const randomChar = String.fromCharCode(fakerInstance.datatype.number(26) + 97);
        errors.push({ type: 'insert', index: insertIndex, char: randomChar });
        break;
      case 2:
        const swapIndex = fakerInstance.datatype.number(seed.length - 1);
        errors.push({ type: 'swap', index: swapIndex });
        break;
    }
    
console.log('Generated error type:', errorType);

  }
  console.log('Generated errors:', errors);
  return errors;
}




function generateErrorsInExistingData() {
  allData.forEach(rowData => {
    const errors = generateErrors(parseFloat(errorInput.value), rowData.address, faker);
   console.log(errorInput.value)

    errors.forEach(error => {
      console.log('Applying error:', error)
      let fullNameArray = rowData.fullName.split('');
      let addressArray = rowData.address.split(''); 
      let phoneNumberArray = rowData.phoneNumber.split('');

      switch (error.type) {
        case 'delete':
          fullNameArray.splice(error.index, 1);
          addressArray.splice(error.index, 1);
          phoneNumberArray.splice(error.index, 1);
          break;
        case 'insert':
          fullNameArray.splice(error.index, 0, error.char);
          addressArray.splice(error.index, 0, error.char);
          phoneNumberArray.splice(error.index, 0, error.char);
          break;
        case 'swap':
          const tempName = fullNameArray[error.index];
          const tempAddress = addressArray[error.index];
          const tempPhone = phoneNumberArray[error.index];

          fullNameArray[error.index] = fullNameArray[error.index + 1];
          addressArray[error.index] = addressArray[error.index + 1];
          phoneNumberArray[error.index] = phoneNumberArray[error.index + 1];

          fullNameArray[error.index + 1] = tempName;
          addressArray[error.index + 1] = tempAddress;
          phoneNumberArray[error.index + 1] = tempPhone;
          break;
      }

      rowData.fullName = fullNameArray.join('');
      rowData.address = addressArray.join('');
      rowData.phoneNumber = phoneNumberArray.join('');
    });
  });

  renderTable(allData);
}





function generateTableRow(number) {
  const fullName = Array.from(generateFullName());
  const address = Array.from(generateAddress());
  const phoneNumber = Array.from(generatePhoneNumber());
  const seed = number;
  const errorRate = errorInput.value;
  const errors = generateErrors(errorRate, seed);

  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];

    switch (error.type) {
      case 'delete':
        fullName.splice(error.index, 1);
        address.splice(error.index, 1);
        phoneNumber.splice(error.index, 1);
        break;
      case 'insert':
        fullName.splice(error.index, 0, error.char);
        address.splice(error.index, 0, error.char);
        phoneNumber.splice(error.index, 0, error.char);
        break;
      case 'swap':
        const tempName = fullName[error.index];
        const tempAddress = address[error.index];
        const tempPhone = phoneNumber[error.index];

        fullName[error.index] = fullName[error.index + 1];
        address[error.index] = address[error.index + 1];
        phoneNumber[error.index] = phoneNumber[error.index + 1];

        fullName[error.index + 1] = tempName;
        address[error.index + 1] = tempAddress;
        phoneNumber[error.index + 1] = tempPhone;
        break;
    }
  }

  return {
    number,
    randomId: generateRandomId(),
    fullName: fullName.join(''),
    address: address.join(''),
    phoneNumber: phoneNumber.join(''),
  };
}


function generateTableData(startNumber, numRows) {
  const numericSeed = parseFloat(currentSeed);
  faker.seed(numericSeed);
  const tableData = [];
  for (let i = 0; i < numRows; i++) {
    const combinedSeed = numericSeed + currentDataPage + i; // Combine user seed with page number and index
    faker.seed(combinedSeed); // Set seed for each row

    const rowData = generateTableRow(startNumber + i, combinedSeed);
    tableData.push(rowData);
  }
  return tableData;
}






const numRowsPerPage = 20;
let currentDataPage = 1;
let allData = [];

function renderTable(data) {
  const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];

  tableBody.innerHTML = '';

  data.forEach((rowData, index) => {
    const row = tableBody.insertRow(index);
    const { number, randomId, fullName, address, phoneNumber } = rowData;

    row.insertCell(0).textContent = number;
    row.insertCell(1).textContent = randomId;
    row.insertCell(2).textContent = fullName;
    row.insertCell(3).textContent = address;
    row.insertCell(4).textContent = phoneNumber;
  });
}

function loadMoreData() {
  const startNumber = (currentDataPage - 1) * numRowsPerPage + 1;
  const newDataPerPage = currentDataPage === 1 ? numRowsPerPage : 10;
  const newData = generateTableData(startNumber, newDataPerPage);

  if (currentDataPage === 1) {
    allData = [...newData];
  } else {
    allData = [...allData, ...newData];
  }

  renderTable(allData);
  currentDataPage++;
}

document.getElementById('region').addEventListener('change', function () {
  const selectedRegion = this.value;

  setLocaleByRegion(selectedRegion);

  currentRegion = selectedRegion;
  allData = [];
  currentDataPage = 1;
  loadMoreData();
});

setLocaleByRegion(currentRegion);

window.addEventListener('scroll', function () {
  const scrollTop = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollTop + clientHeight >= scrollHeight - 10) {
    loadMoreData();
  }
});

errorInput.addEventListener('input', function () {
  const inputValue = errorInput.value;
  errorSlider.value = isNaN(inputValue) ? 0 : inputValue;
});

errorSlider.addEventListener('input', function () {
  errorInput.value = errorSlider.value;
});

setLocaleByRegion(currentRegion);

loadMoreData();
