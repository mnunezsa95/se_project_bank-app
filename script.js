"use strict";

/* ---------------------------------------------------------------------------------------------- */
/*                                              Data                                              */
/* ---------------------------------------------------------------------------------------------- */
const account1 = {
  owner: "Marlon Nunez",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2023-08-20T14:11:59.604Z",
    "2023-08-22T17:01:17.194Z",
    "2023-08-22T23:36:17.929Z",
    "2023-08-23T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Haper Nolan",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const account3 = {
  owner: "Penny Nolan",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Emma Nolan",
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

/* ---------------------------------------------------------------------------------------------- */
/*                                            Functions                                           */
/* ---------------------------------------------------------------------------------------------- */

// Function to show array of movements
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ""; // resetting the container
  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
  movs.forEach(function (movement, index) {
    const movementType = movement > 0 ? "deposit" : "withdrawal";
    const date = new Date(acc.movementsDates[index]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMovement = formatCurrency(movement, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${movementType}">${index + 1} ${movementType}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMovement}</div>
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
  currentAccount.balance = balance;
  labelBalance.textContent = `${formatCurrency(balance, acc.locale, acc.currency)}`;
};

// Function to display total in/out summary & interest summary
const calcDisplaySummary = (acc) => {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => {
      return acc + mov;
    }, 0);
  labelSumIn.textContent = `${formatCurrency(incomes, acc.locale, acc.currency)}`;

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => {
      return acc + mov;
    }, 0);
  labelSumOut.textContent = `${formatCurrency(Math.abs(out), acc.locale, acc.currency)}`;

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => {
      return acc + int;
    }, 0);
  labelSumInterest.textContent = `${formatCurrency(interest, acc.locale, acc.currency)}`;
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

// Function for creating timer
const startLogOutTimer = () => {
  let time = 360;
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Login to get started";
      containerApp.style.opacity = 0;
    }
    time--; // reduce one second every function call
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// Calling function to create usernames
createUsernames(accounts);

// Function for updating UI
const updateUI = (acc) => {
  displayMovements(acc); // Display movements
  calcDisplayBalance(acc); // Display balance
  calcDisplaySummary(acc); // Display summary
};

// global variables
let currentAccount;
let timer;

// Event Handler for Logging In
btnLogin.addEventListener("click", function (e) {
  e.preventDefault(); // Prevent form from submitting
  currentAccount = accounts.find((acc) => {
    return acc.username === inputLoginUsername.value;
  });
  // Display UI & welcome message & clear input fields & set date
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`;
    containerApp.style.opacity = 100;

    const currentDate = new Date();
    const dateOptions = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    };
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, dateOptions).format(currentDate);

    inputLoginPin.value = "";
    inputLoginUsername.value = "";
    inputLoginUsername.blur();
    inputLoginPin.blur();
    if (timer) clearInterval(timer); // clearing any timer that might be running
    timer = startLogOutTimer();
    updateUI(currentAccount);
  }
});

// Event Handler for transferring money
btnTransfer.addEventListener("click", (evt) => {
  evt.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find((acc) => acc.username === inputTransferTo.value);
  if (amount > 0 && receiverAcc && currentAccount.balance >= amount && receiverAcc?.username !== currentAccount.username) {
    // Doing the transfer

    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
  inputTransferAmount.value = inputTransferTo.value = "";
  clearInterval(timer);
  timer = startLogOutTimer();
});

// Handler for loaning
btnLoan.addEventListener("click", (evt) => {
  evt.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some((mov) => mov >= amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
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

const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) => {
    return Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
  };
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = (value, locale, currency) => {
  const currencyOptions = {
    style: "currency",
    currency: currency,
  };
  return new Intl.NumberFormat(locale, currencyOptions).format(value);
};
