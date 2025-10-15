// Stripe initialization
const stripe = Stripe(
  "pk_live_51QsFwjP9CJcub1e6vg91sdRHE7xHPciyqihXeISVqYT8EFpjHOoUPrkSoSCzx2sb56VHHyDusQTmwuoFslxT14zc00M8PzJSDO"
);
const elements = stripe.elements();

const card = elements.create("card", {
  style: {
    base: {
      fontSize: "16px",
      color: "#32325d",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
    },
  },
  hidePostalCode: true,
});

// Global variables
let selectedDate;
let selectedTime;
let appointments = [];
let selectedRoute = "";
const appointmentTemplate = {
  service: "",
  duration: "",
  price: "",
  date: "",
  time: "",
  dateType: "",
  recurring: null,
};
const appointmentDates = [];
const appointmentTimes = [];
const calendarDays = document.getElementById("calendarDays");
const monthYear = document.getElementById("monthYear");
const monthList = document.getElementById("monthList");
const calendarDaysContainer = document.getElementById("calendarDaysContainer");
const timeSlots = document.getElementById("timeSlots");
const skeleton = document.getElementById("skeleton");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const slotsText = document.getElementById("slots-text");
const addedTimesList = document.getElementById("addedTimesList");
const continueDateBtn = document.getElementById("continueDateBtn");
const repeatFrequency = document.getElementById("repeatFrequency");
const timesToRepeat = document.getElementById("timesToRepeat");
const recurringSummary = document.getElementById("recurringSummary");

const current = new Date();
const today = new Date();
today.setHours(0, 0, 0, 0);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let currentStep = 0;
const formSteps = document.querySelectorAll(".form-step");
const nextButtons = document.querySelectorAll(".nextBtnStep");
const prevButtons = document.querySelectorAll(".prevBtnStep");
const contactForm = document.getElementById("contactForm");

// Initialize stepper
function initStepper() {
  formSteps.forEach((step, index) => {
    step.classList.toggle("active", index === currentStep);
  });
}

// Navigation functions
function goToStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= formSteps.length) return;
  currentStep = stepIndex;
  formSteps.forEach((step, index) => {
    step.classList.toggle("active", index === currentStep);
  });
}

function nextStep() {
  if (currentStep === 2 && !validateStep3()) return;
  if (currentStep < formSteps.length - 1) {
    goToStep(currentStep + 1);
    if (currentStep === 3) {
      const formData = collectFormData();
      populateCheckout(formData);
    }
  }
}

function prevStep() {
  if (currentStep > 0) goToStep(currentStep - 1);
}

// Form validation
function validateStep3() {
  clearErrors();
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "pickupLocation",
    "dropOffLocation",
    "passengers",
  ];
  let isValid = true;

  requiredFields.forEach((field) => {
    const input = document.querySelector(`[name="${field}"]`);
    if (!input || !input.value.trim()) {
      showError(input, "This field is required");
      if (isValid) input.focus();
      isValid = false;
    }
  });

  const email = document.querySelector('[name="email"]');
  if (email && email.value && !/^\S+@\S+\.\S+$/.test(email.value)) {
    showError(email, "Please enter a valid email");
    if (isValid) email.focus();
    isValid = false;
  }

  const phoneInput = document.querySelector('[name="phone"]');
  if (
    phoneInput &&
    phoneInput.value &&
    window.phoneIti &&
    !window.phoneIti.isValidNumber()
  ) {
    showError(phoneInput, "Please enter a valid phone number");
    if (isValid) phoneInput.focus();
    isValid = false;
  }

  const passengers = document.querySelector('[name="passengers"]');
  if (passengers && passengers.value) {
    const num = parseInt(passengers.value);
    if (isNaN(num) || num < 1 || num > 6) {
      showError(passengers, "Must be between 1 and 6");
      if (isValid) passengers.focus();
      isValid = false;
    }
  }

  return isValid;
}

function showError(input, message) {
  if (!input) return;
  input.classList.add("is-invalid");
  const errorElement = document.createElement("div");
  errorElement.className = "error";
  errorElement.textContent = message;
  input.parentNode.insertBefore(errorElement, input.nextSibling);
}

function clearErrors() {
  document
    .querySelectorAll(".is-invalid")
    .forEach((el) => el.classList.remove("is-invalid"));
  document.querySelectorAll(".error").forEach((el) => el.remove());
}

// Form data collection
function collectFormData() {
  return {
    route:
      appointmentTemplate.service === $("#custom-route").val()
        ? appointmentTemplate.service
        : appointments[0].service,
    dateType:
      appointmentTemplate.service === $("#custom-route").val()
        ? "single"
        : appointments[0].dateType,
    dates:
      appointmentTemplate.service !== $("#custom-route").val()
        ? appointmentDates
        : [appointmentTemplate.date],
    time: appointmentTimes,
    recurringInfo:
      appointments[0]?.dateType === "recurring"
        ? {
            day: appointments[0].recurring.frequency,
            weeks: appointments[0].recurring.times,
          }
        : null,
    firstName: document.querySelector("#firstName").value.trim(),
    lastName: document.querySelector("#lastName").value.trim(),
    phoneNumber: window.phoneIti ? window.phoneIti.getNumber() : "",
    email: document
      .querySelector("#email")
      .value.trim()
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0),
    pickupLocation: document.querySelector("#pickupLocation").value.trim(),
    dropoffLocation: document.querySelector("#dropOffLocation").value.trim(),
    passengers: document.querySelector("#passengers").value.trim().toString(),
    mobileOnPickupDay: window.mobileOnDayIti
      ? window.mobileOnDayIti.getNumber()
      : "",
    notes: document.querySelector("#notes").value.trim(),
  };
}

// Form submission
async function handleFormSubmit(event) {
  event.preventDefault();
  if (!validateStep3()) return;

  const submitBtn = document.getElementById("contineToPaymentBtn");
  const form = document.getElementById("contactForm");
  const errorDisplay = document.createElement("div");
  errorDisplay.className = "error-message";
  submitBtn.insertAdjacentElement("afterend", errorDisplay);

  try {
    form.classList.add("form-loading");
    submitBtn.classList.add("btn-disabled");
    submitBtn.textContent = "Processing...";
    errorDisplay.style.display = "none";

    const formData = collectFormData();
    console.log("formData--->", formData);
    if (appointmentTemplate.service === $("#custom-route").val()) {
      const result = await submitDetail(formData);
      if (result.success) {
        Swal.fire({
          title: "Thank You for Your Request!",
          text: "We have received your custom route inquiry. Our team will review your details and get back to you shortly with a quote and availability.",
          icon: "success",
          confirmButtonText: "OK",
          footer:
            "<p>If it's urgent, feel free to call us directly at <a href='tel:+1 (587) 338-2806‬'>+1 (587) 338-2806‬</a></p>",
        }).then(() => {
          window.location.href = "/";
        });
      } else {
        throw new Error(result.message || "Failed to submit booking");
      }
    } else {
      nextStep();
    }
  } catch (error) {
    console.error("Booking Error:", error);
    errorDisplay.textContent =
      error.message || "An error occurred while booking. Please try again.";
    errorDisplay.style.display = "block";
  } finally {
    form.classList.remove("form-loading");
    submitBtn.classList.remove("btn-disabled");
    submitBtn.textContent = "Continue to Payment";
  }
}

// Payment handling
function populateCheckout(formData) {
  if (currentStep !== 3) return;

  const submitButton = document.getElementById("submit-payment");
  const paymentForm = document.getElementById("payment-form");
  const errorDisplay = document.createElement("div");
  errorDisplay.className = "error-message";
  submitButton.insertAdjacentElement("afterend", errorDisplay);

  try {
    $("#firstNameCheckout").val(formData.firstName);
    $("#lastNameCheckout").val(formData.lastName);

    if (!card._complete) {
      card.mount("#card-element");
    }

    let totalPrice = 0;
    const appointmentsHTML = appointments
      .map((appointment) => {
        const priceNumber = parseFloat(
          appointment.price.replace(/[^0-9.-]+/g, "")
        );
        if (isNaN(priceNumber)) throw new Error("Invalid price format");
        totalPrice += priceNumber;
        return `
        <div class="appointment-card" style="display: flex; justify-content: space-between;">
          <div>
            <p><strong>${appointment.service}</strong></p>
            <p>${appointment.date} at ${appointment.time} MDT</p>
          </div>
          <div>${appointment.price}</div>
        </div>
      `;
      })
      .join("");

    let tip = totalPrice * 0.18;
    totalAmount = totalPrice + tip;

    if (formData.dateType === "recurring" && formData.recurringInfo) {
      totalPrice = totalPrice * formData.recurringInfo.weeks;
      totalAmount = totalAmount * formData.recurringInfo.weeks;
    }

    const summaryHTML = `
      <div>
        <div class="border-bottom-black">
          ${appointmentsHTML}
        </div>
        <div style="display: flex; justify-content: space-between; margin: 15px 0px;"> 
          <div>SubTotal</div> 
          <div>CA$${totalPrice.toFixed(2)}</div> 
        </div>
        <div style="display: flex; justify-content: space-between; margin: 15px 0px;" class="border-bottom-black "> 
          <div>Tip</div> 
          <div class="tip-amount">CA$${tip.toFixed(2)}</div> 
        </div>
        <div style="display: flex; justify-content: space-between; margin: 15px 0px;"> 
          <div><strong>Total due</strong></div> 
          <div class="total-amount">CA$${(totalPrice + tip).toFixed(2)}</div> 
        </div>
      </div>
    `;

    document.querySelector(".order-summary").innerHTML = summaryHTML;

    const tip15 = document.getElementById("tip15");
    const tip18 = document.getElementById("tip18");
    const tip20 = document.getElementById("tip20");

    const tip15Value = totalPrice * 0.15;
    const tip18Value = totalPrice * 0.18;
    const tip20Value = totalPrice * 0.2;

    tip15.textContent = tip15Value.toFixed(2);
    tip18.textContent = tip18Value.toFixed(2);
    tip20.textContent = tip20Value.toFixed(2);

    const tipBoxes = document.querySelectorAll(".tip-box");
    tipBoxes[2].classList.add("selected");

    const updateTotal = (newTip) => {
      tip = newTip;
      totalAmount = totalPrice + tip;
      const tipDisplay = document.querySelector(".tip-amount");
      const totalDisplay = document.querySelector(".total-amount");
      tipDisplay.textContent = `CA$${tip.toFixed(2)}`;
      totalDisplay.textContent = `CA$${(totalPrice + tip).toFixed(2)}`;
    };

    tipBoxes.forEach((box) => {
      box.addEventListener("click", () => {
        tipBoxes.forEach((b) => b.classList.remove("selected"));
        box.classList.add("selected");

        const tipText = box.querySelector("p").textContent;
        if (tipText === "No tip") updateTotal(0);
        else if (tipText === "15%") updateTotal(tip15Value);
        else if (tipText === "18%") updateTotal(tip18Value);
        else if (tipText === "20%") updateTotal(tip20Value);
      });
    });

    const customTipInput = document.getElementById("custom-tip");
    const applyTipButton = document.querySelector(".btn.mx-3");
    applyTipButton.addEventListener("click", () => {
      const customTipValue = parseFloat(customTipInput.value) || 0;
      if (customTipValue >= 0) {
        updateTotal(customTipValue);
        tipBoxes.forEach((b) => b.classList.remove("selected"));
      } else {
        errorDisplay.textContent = "Please enter a valid tip amount";
        errorDisplay.style.display = "block";
      }
    });

    submitButton.addEventListener("click", async (event) => {
      event.preventDefault();
      if (submitButton.classList.contains("btn-disabled")) return;

      submitButton.classList.add("btn-disabled");
      submitButton.textContent = "Processing...";
      paymentForm.classList.add("form-loading");
      errorDisplay.style.display = "none";

      try {
        const response = await fetch(
          "https://bow-valle-chauffer-backend.vercel.app/api/create-payment-intent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: Math.round(totalAmount * 100),
              currency: "cad",
            }),
            signal: AbortSignal.timeout(30000),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Failed to create payment intent"
          );
        }

        const { clientSecret } = await response.json();
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: card,
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email[0],
            },
          },
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.paymentIntent.status === "succeeded") {
          const bookingResult = await submitDetail(formData);
          if (bookingResult.success) {
            Swal.fire({
              title: "Payment Successful!",
              text: "Your booking is confirmed.",
              icon: "success",
              confirmButtonText: "OK",
            }).then(() => {
              window.location.href = "/";
            });
          } else {
            throw new Error(
              bookingResult.message || "Booking confirmation failed"
            );
          }
        }
      } catch (error) {
        console.error("Payment Error:", error);
        errorDisplay.textContent =
          error.message ||
          "An error occurred during payment. Please try again.";
        errorDisplay.style.display = "block";
      } finally {
        submitButton.classList.remove("btn-disabled");
        submitButton.textContent = "Pay and Confirm Order";
        paymentForm.classList.remove("form-loading");
      }
    });

    card.on("change", (event) => {
      errorDisplay.textContent = event.error ? event.error.message : "";
      errorDisplay.style.display = event.error ? "block" : "none";
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    errorDisplay.textContent =
      "An error occurred while loading checkout. Please refresh the page.";
    errorDisplay.style.display = "block";
    submitButton.classList.add("btn-disabled");
  }
}

// Phone input initialization
function initPhoneInputs() {
  if (window.intlTelInput) {
    const phoneInput = document.querySelector("#phone");
    const mobileOnDayInput = document.querySelector("#mobileOnDay");

    const initializeInput = (input) => {
      const iti = window.intlTelInput(input, {
        initialCountry: "ca",
        separateDialCode: true,
        utilsScript:
          "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
      });

      input.addEventListener("countrychange", () => {
        const countryData = iti.getSelectedCountryData();
        const dialCode = countryData.dialCode ? `+${countryData.dialCode}` : "";
      });

      return iti;
    };

    window.phoneIti = phoneInput ? initializeInput(phoneInput) : null;
    window.mobileOnDayIti = mobileOnDayInput
      ? initializeInput(mobileOnDayInput)
      : null;
  }
}

// Calendar functionsf
function renderCalendar() {
  try {
    const calendarDays = document.getElementById("calendarDays");
    const monthYear = document.getElementById("monthYear"); // Ensure this exists in your HTML
    if (!calendarDays || !monthYear) {
      throw new Error("Calendar elements not found");
    }

    calendarDays.innerHTML = "";
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = `${current.toLocaleString("default", {
      month: "long",
    })} ${year}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Define the booking start date for 2025
    const bookingStartDate2025 = new Date(2026, 1, 1); // January 1, 2026
    bookingStartDate2025.setHours(0, 0, 0, 0);

    // Define the maximum booking date (1 year from today)
    const maxBookingDate = new Date(today);
    maxBookingDate.setFullYear(today.getFullYear() + 1);
    maxBookingDate.setHours(0, 0, 0, 0);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      const emptyDiv = document.createElement("div");
      emptyDiv.classList.add("day");
      emptyDiv.style.visibility = "hidden";
      calendarDays.appendChild(emptyDiv);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement("div");
      dayDiv.classList.add("day");
      dayDiv.textContent = day;

      const dateToCheck = new Date(year, month, day);
      dateToCheck.setHours(0, 0, 0, 0);

      // Disable dates based on the logic
      if (
        dateToCheck < today ||
        (year === 2025 && dateToCheck < bookingStartDate2025) ||
        dateToCheck > maxBookingDate
      ) {
        dayDiv.classList.add("disabled");
      } else {
        dayDiv.addEventListener("click", async function () {
          const errorDisplay = document.createElement("div");
          errorDisplay.className = "error-message";
          calendarDays.insertAdjacentElement("afterend", errorDisplay);

          try {
            document
              .querySelectorAll(".day")
              .forEach((d) => d.classList.remove("selected"));
            dayDiv.classList.add("selected");

            const date = new Date(year, month, day);
            const yearStr = date.getFullYear();
            const monthStr = String(date.getMonth() + 1).padStart(2, "0");
            const dayStr = String(date.getDate()).padStart(2, "0");

            selectedDate = `${yearStr}-${monthStr}-${dayStr}`;

            if (appointmentTemplate.service === $("#custom-route").val()) {
              appointmentTemplate.date = selectedDate;
              $("#contineToPaymentBtn").text("Book Now");
              nextStep();
            } else {
              showSkeletonEffect();

              const response = await fetch(
                "https://bow-valle-chauffer-backend.vercel.app/api/slots/available",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    date: selectedDate,
                    type: selectedRoute,
                  }),
                  signal: AbortSignal.timeout(30000),
                }
              );

              if (!response.ok) {
                throw new Error("Failed to fetch available slots");
              }

              const data = await response.json();
              slotsText.innerHTML =
                "TIME ZONE: MOUNTAIN TIME - EDMONTON (GMT-06:00)";

              if (data.availableSlots && data.availableSlots.length > 0) {
                if (
                  data.date >= "2025-06-01" &&
                  data.date <= "2025-06-30" &&
                  data.type === "banff-to-calgary"
                ) {
                  const index = data.availableSlots.indexOf("6:00 AM");
                  if (index !== -1) {
                    data.availableSlots.splice(index, 1);
                  }
                }
                if (
                  data.date >= "2025-06-01" &&
                  data.date <= "2025-06-30" &&
                  data.type === "calgary-to-banff"
                ) {
                  const index = data.availableSlots.indexOf("9:00 AM");
                  if (index !== -1) {
                    data.availableSlots.splice(index, 1);
                  }
                }
                $(".time-slot").addClass("d-none");
                data.availableSlots.forEach((slot) => {
                  if (slot === "6:00 AM") $(".6amslot").removeClass("d-none");
                  if (slot === "12:00 PM") $(".12pmslot").removeClass("d-none");
                  if (slot === "6:00 PM") $(".6pmslot").removeClass("d-none");
                  if (slot === "9:00 AM") $(".9amslot").removeClass("d-none");
                  if (slot === "3:00 PM") $(".3pmslot").removeClass("d-none");
                });
              } else {
                timeSlots.innerHTML = `<div><strong>No slot found, please choose another date</strong></div>`;
                dayDiv.classList.add("disabled");
                dayDiv.classList.remove("selected");
                errorDisplay.textContent =
                  "No available slots for this date. Please select another date.";
                errorDisplay.style.display = "block";
              }
              skeleton.classList.add("d-none");
              timeSlots.classList.remove("d-none");
              timeSlots.classList.add("d-flex");
              setupTimeSlots();
            }
          } catch (error) {
            console.error("Calendar Error:", error);
            errorDisplay.textContent =
              error.message ||
              "Failed to load available slots. Please try again.";
            errorDisplay.style.display = "block";
            skeleton.classList.add("d-none");
          }
        });
      }

      calendarDays.appendChild(dayDiv);
    }

    // Mark existing appointments
    appointments.forEach((appt) => {
      if (appt.date) {
        const apptDate = new Date(appt.date);
        if (apptDate.getFullYear() === year && apptDate.getMonth() === month) {
          const dayElement = Array.from(calendarDays.children).find(
            (d) => parseInt(d.textContent) === apptDate.getDate()
          );
          if (dayElement) dayElement.classList.add("selected");
        }
      }
    });
  } catch (error) {
    console.error("Render Calendar Error:", error);
    const calendarDays = document.getElementById("calendarDays");
    if (calendarDays) {
      calendarDays.innerHTML =
        "<div>Error loading calendar. Please refresh the page.</div>";
    }
  }
}

function renderMonths() {
  monthList.innerHTML = "";
  months.forEach((month, index) => {
    const monthDiv = document.createElement("div");
    monthDiv.classList.add("month-item");
    monthDiv.textContent = month;
    monthDiv.addEventListener("click", () => {
      current.setMonth(index);
      isMonthView = false;
      toggleView();
      renderCalendar();
    });
    monthList.appendChild(monthDiv);
  });
}

function toggleView() {
  if (isMonthView) {
    monthList.classList.remove("d-none");
    calendarDaysContainer.classList.add("d-none");
    prevBtn.onclick = prevYear;
    nextBtn.onclick = nextYear;
  } else {
    monthList.classList.add("d-none");
    calendarDaysContainer.classList.remove("d-none");
    prevBtn.onclick = prevMonth;
    nextBtn.onclick = nextMonth;
  }
}

function prevMonth() {
  current.setMonth(current.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  current.setMonth(current.getMonth() + 1);
  renderCalendar();
}

function prevYear() {
  current.setFullYear(current.getFullYear() - 1);
  renderMonths();
}

function nextYear() {
  current.setFullYear(current.getFullYear() + 1);
  renderMonths();
}

function showSkeletonEffect() {
  timeSlots.classList.add("d-none");
  skeleton.classList.remove("d-none");
  skeleton.innerHTML = `
    <div class="skeleton-time-slots">
      <div class="skeleton-time-slot"></div>
      <div class="skeleton-time-slot"></div>
      <div class="skeleton-time-slot"></div>
    </div>
  `;
}

// Time slot handling
function setupTimeSlots() {
  if (!selectedDate) {
    console.error("No date selected for time slots");
    return;
  }

  const timeSlotElements = document.querySelectorAll(".time-slot:not(.d-none)");
  timeSlotElements.forEach((slot) => {
    const button = slot.querySelector("button");
    const time = button.textContent.trim();

    const continueOption = slot.querySelector(".continue-option");
    // const addAnotherOption = slot.querySelector(".add-another-option");
    // const makeRecurringOption = slot.querySelector(".make-recurring-option");
    const addAnotherOption = "";
    const makeRecurringOption = "";

    // if (!continueOption || !addAnotherOption || !makeRecurringOption) {
    //   console.error("Dropdown items not found for time slot:", time);
    //   return;
    // }

    continueOption.onclick = (e) => {
      e.preventDefault();
      selectedTime = time;
      const newAppointment = {
        service: appointmentTemplate.service,
        duration: appointmentTemplate.duration,
        price: appointmentTemplate.price,
        date: selectedDate,
        time: selectedTime,
        dateType: "single",
        recurring: null,
      };
      appointmentDates.push(selectedDate);
      appointmentTimes.push(selectedTime);
      appointments = [newAppointment];
      nextStep();
      renderAddedTimes();
    };

    addAnotherOption.onclick = (e) => {
      e.preventDefault();
      selectedTime = time;
      continueDateBtn.classList.remove("d-none");
      const newAppointment = {
        ...appointmentTemplate,
        service: appointmentTemplate.service,
        duration: appointmentTemplate.duration,
        price: appointmentTemplate.price,
        date: selectedDate,
        time: selectedTime,
        recurring: null,
        dateType: "multiple",
      };

      const alreadyExists = appointments.some(
        (appt) =>
          appt.date === newAppointment.date && appt.time === newAppointment.time
      );

      if (!alreadyExists) {
        appointments.push(newAppointment);
        appointmentDates.push(selectedDate);
        appointmentTimes.push(selectedTime);
        renderAddedTimes();
        renderCalendar();
        showSkeletonEffect();
      } else {
        Swal.fire({
          title: "Duplicate Entry",
          text: "This date/time combination already exists in your appointments.",
          icon: "warning",
        });
      }
    };

    makeRecurringOption.onclick = (e) => {
      e.preventDefault();
      selectedTime = time;
      document.getElementById("step2Content").classList.add("d-none");
      const recurringForm = document.getElementById("recurringForm");
      recurringForm.classList.remove("d-none");
      document.getElementById(
        "recurringDateTimeDisplay"
      ).textContent = `${selectedDate.toLocaleString("default", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })} at ${selectedTime}`;
      updateRecurringSummary();
    };
  });
}

// Appointment list rendering
function renderAddedTimes() {
  addedTimesList.innerHTML = "";
  appointments
    .filter((appt) => appt.date && appt.time)
    .forEach((appt, index) => {
      const timeDiv = document.createElement("div");
      timeDiv.classList.add("added-time");
      const date = new Date(appt.date);
      const formattedDate = `${date.toLocaleString("default", {
        month: "long",
      })} ${date.getDate()}${getOrdinalSuffix(
        date.getDate()
      )}, ${date.getFullYear()}`;
      timeDiv.innerHTML = `
        <span>${formattedDate} at ${appt.time}</span>
        <a href="#" class="remove-link text-black" onclick="removeAddedTime(${index}); return false;">Remove</a>
      `;
      $("#addedTimes").removeClass("d-none");
      addedTimesList.appendChild(timeDiv);
    });
}

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function removeAddedTime(index) {
  appointments.splice(index, 1);
  appointmentDates.splice(index, 1);
  appointmentTimes.splice(index, 1);
  renderAddedTimes();
  renderCalendar();
  if (appointments.length === 0) {
    $(continueDateBtn).addClass("d-none");
    $(timeSlots).addClass("d-none");
    slotsText.innerHTML =
      "<strong>Select a date to see available times</strong>";
  } else {
    showSkeletonEffect();
  }
}

// Recurring appointments
function updateRecurringSummary() {
  const frequency = repeatFrequency.value;
  const times = timesToRepeat.value;
  recurringSummary.textContent = `This will repeat Every ${frequency} at ${selectedTime} starting ${selectedDate.toLocaleString(
    "default",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  )} for ${times} times.`;
}

document.getElementById("cancelRecurringBtn").onclick = () => {
  document.getElementById("recurringForm").classList.add("d-none");
  document.getElementById("step2Content").classList.remove("d-none");
};

document.getElementById("continueRecurringBtn").onclick = () => {
  const frequency = repeatFrequency.value;
  const times = parseInt(timesToRepeat.value);
  const baseDate = new Date(selectedDate);

  // Clear existing appointments for this recurring series
  appointments = appointments.filter((appt) => appt.dateType !== "recurring");

  for (let i = 0; i < times; i++) {
    const newDate = new Date(baseDate);
    if (frequency === "week") {
      newDate.setDate(newDate.getDate() + 7 * i);
    } else if (frequency === "2weeks") {
      newDate.setDate(newDate.getDate() + 14 * i);
    } else if (frequency === "month") {
      newDate.setMonth(newDate.getMonth() + i);
    }

    const newAppointment = {
      service: appointmentTemplate.service,
      duration: appointmentTemplate.duration,
      price: appointmentTemplate.price,
      date: newDate.toDateString(),
      time: selectedTime,
      recurring: { frequency, times },
      dateType: "recurring",
    };
    appointments.push(newAppointment);
    appointmentDates.push(newDate.toDateString());
    appointmentTimes.push(selectedTime);
  }

  document.getElementById("recurringForm").classList.add("d-none");
  document.getElementById("step2Content").classList.remove("d-none");
  nextStep();
};

repeatFrequency.onchange = updateRecurringSummary;
timesToRepeat.onchange = updateRecurringSummary;

// Calendar view toggle
let isMonthView = false;
monthYear.addEventListener("click", () => {
  isMonthView = !isMonthView;
  toggleView();
  if (isMonthView) renderMonths();
});

prevBtn.onclick = prevMonth;
nextBtn.onclick = nextMonth;

// Service selection
document.querySelectorAll(".bookBtn").forEach((btn) =>
  btn.addEventListener("click", (event) => {
    const errorDisplay = document.createElement("div");
    errorDisplay.className = "error-message";
    btn.insertAdjacentElement("afterend", errorDisplay);

    try {
      btn.classList.add("btn-disabled");
      const id = event.target.getAttribute("data-id");
      if (id === "BtoC") {
        $(".route").text("Banff to Calgary with Driver 1");
        selectedRoute = "banff-to-calgary";
        appointmentTemplate.service = "Banff to Calgary with Driver 1";
        appointmentTemplate.duration = "2 hours";
        appointmentTemplate.price = "CA$475.00";
        $(".time_price").removeClass("d-none");
      } else if (id === "CtoB") {
        $(".route").text("Calgary to Banff with Driver 1");
        appointmentTemplate.service = "Calgary to Banff with Driver 1";
        appointmentTemplate.duration = "2 hours";
        appointmentTemplate.price = "CA$475.00";
        selectedRoute = "calgary-to-banff";
        $(".time_price").removeClass("d-none");
      } else if (id === "custom_route") {
        let route = $("#custom-route").val();
        if (!route.trim()) {
          throw new Error("Please enter a custom route");
        }
        $(".route").text(route.toString());
        $(".time_price").addClass("d-none");
        appointmentTemplate.service = route;
        appointmentTemplate.duration = "";
        appointmentTemplate.price = "";
      }
      nextStep();
    } catch (error) {
      console.error("Book Button Error:", error);
      errorDisplay.textContent =
        error.message || "Failed to process selection. Please try again.";
      errorDisplay.style.display = "block";
    } finally {
      btn.classList.remove("btn-disabled");
    }
  })
);

continueDateBtn.addEventListener("click", () => {
  nextStep();
});

// API submission
async function submitDetail(formData) {
  try {
    const response = await fetch(
      "https://bow-valle-chauffer-backend.vercel.app/api/slots/book",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Submission Error:", error);
    return { success: false, message: error.message };
  }
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialization
document.addEventListener("DOMContentLoaded", function () {
  try {
    renderCalendar();
    initStepper();
    initPhoneInputs();

    const debouncedNextStep = debounce(nextStep, 300);
    const debouncedPrevStep = debounce(prevStep, 300);

    nextButtons.forEach((button) =>
      button.addEventListener("click", debouncedNextStep)
    );
    prevButtons.forEach((button) =>
      button.addEventListener("click", debouncedPrevStep)
    );

    if (contactForm) {
      contactForm.addEventListener("submit", handleFormSubmit);
    }

    document
      .querySelectorAll("#contactForm input, #contactForm textarea")
      .forEach((input) => {
        input.addEventListener("blur", function () {
          if (currentStep === 2) {
            this.classList.remove("is-invalid");
            const errorMsg = this.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains("error")) {
              errorMsg.remove();
            }
            if (!this.value.trim()) {
              showError(this, "This field is required");
            }
            if (this.name === "passengers" && this.value) {
              const num = parseInt(this.value);
              if (isNaN(num) || num < 1 || num > 6) {
                showError(this, "Must be between 1 and 6");
              }
            }
          }
        });
      });

    $("#timesToRepeat").empty();
    for (let i = 1; i <= 24; i++) {
      $("#timesToRepeat").append(`<option value="${i}">${i}</option>`);
    }
  } catch (error) {
    console.error("Initialization Error:", error);
    Swal.fire({
      title: "Error",
      text: "Failed to initialize the application. Please refresh the page.",
      icon: "error",
    });
  }
});
