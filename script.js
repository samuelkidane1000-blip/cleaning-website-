const serviceSelect = document.getElementById('service');
const hoursInput = document.getElementById('hours');
const ovenInput = document.getElementById('oven');
const suppliesInput = document.getElementById('supplies');
const frequencySelect = document.getElementById('frequency');
const quoteTotal = document.getElementById('quoteTotal');
const quoteBreakdown = document.getElementById('quoteBreakdown');
const bookingForm = document.getElementById('bookingForm');
const successMessage = document.getElementById('successMessage');
const submitBtn = document.getElementById('submitBtn');
const year = document.getElementById('year');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');

function formatGBP(value) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(value);
}

function getServiceName() {
  return serviceSelect.options[serviceSelect.selectedIndex].text.split('—')[0].trim();
}

function getSafeHours() {
  const hours = parseFloat(hoursInput.value || '2');
  return hours < 2 ? 2 : hours;
}

function updateQuote() {
  const hourlyRate = parseFloat(serviceSelect.value || '0');
  const hours = getSafeHours();
  const oven = ovenInput.checked ? parseFloat(ovenInput.value || '0') : 0;
  const supplies = suppliesInput.checked ? parseFloat(suppliesInput.value || '0') : 0;
  const total = (hourlyRate * hours) + oven + supplies;

  hoursInput.value = hours;
  quoteTotal.textContent = formatGBP(total);

  const extras = [];
  if (oven) extras.push('inside oven clean');
  if (supplies) extras.push('hoover & mop provided by us');

  quoteBreakdown.textContent =
    `${getServiceName()} · ${hours} hours · ${frequencySelect.value}${extras.length ? ' · ' + extras.join(' · ') : ''}`;
}

[serviceSelect, hoursInput, ovenInput, suppliesInput, frequencySelect].forEach((el) => {
  el.addEventListener('input', updateQuote);
  el.addEventListener('change', updateQuote);
});

bookingForm.addEventListener('submit', function (event) {
  event.preventDefault();

  updateQuote();

  const extrasList = [];
  if (ovenInput.checked) extrasList.push('Inside oven clean');
  if (suppliesInput.checked) extrasList.push('Hoover & mop provided by us');

  const message = `Hi Nestlyn Clean, I'd like to book:

Service: ${getServiceName()}
Frequency: ${frequencySelect.value}
Hours: ${hoursInput.value}
Date: ${dateInput.value}
Time: ${timeInput.value}
Extras: ${extrasList.length ? extrasList.join(', ') : 'None'}
Estimated total: ${quoteTotal.textContent}

Name: ${nameInput.value.trim()}
Phone: ${phoneInput.value.trim()}
Email: ${emailInput.value.trim()}`;

  const whatsappURL = `https://wa.me/447514718173?text=${encodeURIComponent(message)}`;

  window.open(whatsappURL, '_blank');

  if (successMessage) {
    successMessage.innerHTML = `
      <h3>Booking Sent Successfully</h3>
      <p>Your booking details have been prepared in WhatsApp.</p>
    `;
    successMessage.hidden = false;
  }
});

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');

if (dateInput) dateInput.min = `${yyyy}-${mm}-${dd}`;
if (year) year.textContent = yyyy;
if (hoursInput) hoursInput.value = 2;
if (timeInput) timeInput.value = '10:00';

updateQuote();
