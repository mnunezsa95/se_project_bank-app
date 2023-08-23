"use strict";

/* ---------------------------------------------------------------------------------------------- */
/*                                              Data                                              */
/* ---------------------------------------------------------------------------------------------- */
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

/* ---------------------------------------------------------------------------------------------- */
/*                                            Elements                                            */
/* ---------------------------------------------------------------------------------------------- */
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// Function to show array of movements
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = ""; // resetting the container

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (movement, index) {
    const movementType = movement > 0 ? "deposit" : "withdrawal";
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${movementType}">${index + 1} ${movementType}</div>
        <div class="movements__date">3 days ago</div>
        <div class="movements__value">${movement} €</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// Function to add up the balance and display the balance on the UI
const calcDisplayBalance = (acc) => {
  const balance = acc.movements.reduce((acc, movement) => {
    return acc + movement;
  }, 0);
  acc.balance = balance;
  labelBalance.textContent = `${acc.balance} €`;
};

// Function to display total in/out summary & interest summary
const calcDisplaySummary = (acc) => {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => {
      return acc + mov;
    }, 0);
  labelSumIn.textContent = `${incomes} €`;

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => {
      return acc + mov;
    }, 0);
  labelSumOut.textContent = `${Math.abs(out)} €`;

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => {
      return acc + int;
    }, 0);
  labelSumInterest.textContent = `${interest} €`;
};

// Function to compute username --> adding a new property to the object for the username
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};

// Calling function to create usernames
createUsernames(accounts);

// Function for updating UI
const updateUI = (acc) => {
  displayMovements(acc.movements); // Display movements
  calcDisplayBalance(acc); // Display balance
  calcDisplaySummary(acc); // Display summary
};

// Event Handler for Logging In
let currentAccount;
btnLogin.addEventListener("click", function (e) {
  e.preventDefault(); // Prevent form from submitting

  //
  currentAccount = accounts.find((acc) => {
    return acc.username === inputLoginUsername.value;
  });

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI & welcome message & clear input fields
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`;
    containerApp.style.opacity = 100;
    inputLoginPin.value = "";
    inputLoginUsername.value = "";
    inputLoginUsername.blur();
    inputLoginPin.blur();
    updateUI(currentAccount);
  }
});

// Event Handler for transferring money
btnTransfer.addEventListener("click", (evt) => {
  evt.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find((acc) => {
    return acc.username === inputTransferTo.value;
  });
  if (amount > 0 && receiverAccount && currentAccount.balance >= amount && receiverAccount?.username !== currentAccount.username) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  inputTransferAmount.value = inputTransferTo.value = "";
});

// Handler for loaning
btnLoan.addEventListener("click", (evt) => {
  evt.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some((mov) => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  inputLoanAmount.value = "";
});

// Handler to delete account
btnClose.addEventListener("click", (evt) => {
  evt.preventDefault();
  if (inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) === currentAccount.pin) {
    const accountIndex = accounts.findIndex((acc) => {
      return acc.username === currentAccount.username;
    });
    accounts.splice(accountIndex, 1); // Deletes user account
    containerApp.style.opacity = 0; // logs out after deleting
  }
  inputCloseUsername.value = inputClosePin.value = ""; // clear input fields
});

// handler for sorting
let sorted = false; // state variable for sorting
btnSort.addEventListener("click", (evt) => {
  evt.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
