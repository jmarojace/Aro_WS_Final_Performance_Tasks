// WS 301 Performance Task: Student Registration Form
// Concepts demonstrated: events, preventDefault(), trim(), validation,
// field-specific errors, classList.add/remove/toggle(), dataset, and attributes.

const form = document.getElementById("registrationForm");
const formAlert = document.getElementById("formAlert");
const resetButton = document.getElementById("resetButton");

const fieldIds = [
  "studentId", "fullName", "email", "phone", "dob", "gender",
  "program", "yearLevel", "password", "confirmPassword", "address", "agreement"
];

const getField = (id) => document.getElementById(id);
const getError = (id) => document.getElementById(`${id}Error`);

// Meaningful attribute manipulation: the date input's max attribute is set
// dynamically so a student cannot select a future date of birth.
const dobInput = getField("dob");
dobInput.setAttribute("max", new Date().toISOString().split("T")[0]);

// Read custom data-* attributes through dataset. This also demonstrates
// dataset.label and dataset.required rather than hard-coding field labels.
function fieldLabel(field) {
  return field.dataset.label || field.name;
}

function setError(field, message) {
  field.classList.add("error");
  field.setAttribute("aria-invalid", "true");
  const errorElement = getError(field.id);
  if (errorElement) errorElement.textContent = message;
}

function clearError(field) {
  field.classList.remove("error");
  field.removeAttribute("aria-invalid");
  const errorElement = getError(field.id);
  if (errorElement) errorElement.textContent = "";
}

function showAlert(message, type) {
  formAlert.textContent = message;
  formAlert.classList.remove("success", "failure");
  formAlert.classList.add(type);
  formAlert.hidden = false;
}

function clearAlert() {
  formAlert.textContent = "";
  formAlert.classList.remove("success", "failure");
  formAlert.hidden = true;
}

function validateField(field) {
  const label = fieldLabel(field);
  const value = field.type === "checkbox" ? field.checked : field.value.trim();

  // The custom data-required attribute controls the required-field check.
  if (field.dataset.required === "true") {
    if (field.type === "checkbox" && !field.checked) {
      setError(field, "Please agree to the registration terms to continue.");
      return false;
    }
    if (field.type !== "checkbox" && value === "") {
      setError(field, `${label} is required.`);
      return false;
    }
  }

  if (field.id === "email" && value !== "") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(value)) {
      setError(field, "Enter a valid email address, such as name@example.com.");
      return false;
    }
  }

  if (field.id === "phone" && value !== "") {
    // Accepted examples: 0917-123-4567 or +63917-123-4567.
    const phonePattern = /^(09\d{2}|\+639\d{2})-\d{3}-\d{4}$/;
    if (!phonePattern.test(value)) {
      setError(field, "Use 09XX-XXX-XXXX or +639XX-XXX-XXXX (for example, 0917-123-4567).");
      return false;
    }
  }

  if (field.id === "dob" && value !== "") {
    const selectedDate = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(selectedDate.getTime()) || selectedDate > today) {
      setError(field, "Date of birth cannot be in the future.");
      return false;
    }
  }

  if (field.id === "password" && value !== "") {
    if (value.length < 8 || !/[A-Za-z]/.test(value) || !/\d/.test(value)) {
      setError(field, "Use at least 8 characters with at least one letter and one number.");
      return false;
    }
  }

  if (field.id === "confirmPassword" && value !== "") {
    if (value !== getField("password").value) {
      setError(field, "Passwords do not match. Please re-enter your password.");
      return false;
    }
  }

  clearError(field);
  return true;
}

// Validate fields as users interact with them, and clear corrected errors.
fieldIds.forEach((id) => {
  const field = getField(id);
  const eventName = field.type === "checkbox" || field.tagName === "SELECT" || field.type === "date"
    ? "change"
    : "blur";

  field.addEventListener(eventName, function () {
    validateField(field);
    if (id === "password" && getField("confirmPassword").value !== "") {
      validateField(getField("confirmPassword"));
    }
    if (!formAlert.hidden) clearAlert();
  });

  if (field.tagName === "INPUT" || field.tagName === "TEXTAREA") {
    field.addEventListener("input", function () {
      if (field.classList.contains("error")) validateField(field);
      if (id === "password" && getField("confirmPassword").value !== "") {
        validateField(getField("confirmPassword"));
      }
      if (!formAlert.hidden) clearAlert();
    });
  }
});

// classList.toggle() powers the Show/Hide Password feature.
// setAttribute() changes the input type dynamically for the feature.
document.querySelectorAll("[data-password-target]").forEach((button) => {
  button.addEventListener("click", function (event) {
    const targetId = event.currentTarget.dataset.passwordTarget;
    const passwordInput = getField(targetId);
    const isShowing = passwordInput.type === "text";

    passwordInput.setAttribute("type", isShowing ? "password" : "text");
    button.classList.toggle("is-visible", !isShowing);
    button.textContent = isShowing ? "Show" : "Hide";
    button.setAttribute("aria-pressed", String(!isShowing));
    button.setAttribute("aria-label", `${isShowing ? "Show" : "Hide"} ${targetId}`);
  });
});

// Handle form submission using the required submit event and event object.
form.addEventListener("submit", function (event) {
  event.preventDefault();

  let isFormValid = true;
  let firstInvalidField = null;

  fieldIds.forEach((id) => {
    const field = getField(id);
    const valid = validateField(field);
    if (!valid) {
      isFormValid = false;
      if (!firstInvalidField) firstInvalidField = field;
    }
  });

  if (!isFormValid) {
    showAlert("Please review the highlighted fields and correct the errors before submitting.", "failure");
    if (firstInvalidField) firstInvalidField.focus();
    return;
  }

  // This coursework demo validates locally; it does not send or store data.
  showAlert("Registration successful! All required information has been validated.", "success");

  // Ensure no validation styling or messages remain after successful validation.
  fieldIds.forEach((id) => clearError(getField(id)));
});

// Reset the form and restore the original interface state.
form.addEventListener("reset", function () {
  // Reset event fires before all controls finish returning to default values.
  window.setTimeout(() => {
    fieldIds.forEach((id) => clearError(getField(id)));
    clearAlert();

    document.querySelectorAll("[data-password-target]").forEach((button) => {
      const target = getField(button.dataset.passwordTarget);
      target.setAttribute("type", "password");
      button.classList.remove("is-visible");
      button.textContent = "Show";
      button.setAttribute("aria-pressed", "false");
      button.removeAttribute("aria-label");
    });

    dobInput.setAttribute("max", new Date().toISOString().split("T")[0]);
  }, 0);
});