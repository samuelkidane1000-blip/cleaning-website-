const serviceSelect = document.getElementById('service');
const hoursInput = document.getElementById('hours');
const ovenInput = document.getElementById('oven');
const suppliesInput = document.getElementById('supplies');
const frequencySelect = document.getElementById('frequency');
const quoteTotal = document.getElementById('quoteTotal');
const quoteBreakdown = document.getElementById('quoteBreakdown');
const bookingForm = document.getElementById('bookingForm');
const successMessage = document.getElementById('successMessage');
const year = document.getElementById('year');

function formatGBP(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
}

function getServiceName() {
  return serviceSelect.options[serviceSelect.selectedIndex].text.split('—')[0].trim();
}

function updateQuote() {
  const hourlyRate = parseFloat(serviceSelect.value || '0');
  const hours = parseFloat(hoursInput.value || '0');
  const oven = ovenInput.checked ? parseFloat(ovenInput.value) : 0;
  const supplies = suppliesInput.checked ? parseFloat(suppliesInput.value) : 0;
  const total = hourlyRate * hours + oven + supplies;

  quoteTotal.textContent = formatGBP(total);

  const extras = [];
  if (oven) extras.push('inside oven clean');
  if (supplies) extras.push('hoover & mop included');

  quoteBreakdown.textContent = `${getServiceName()} · ${hours} hours · ${frequencySelect.value}${extras.length ? ' · ' + extras.join(' · ') : ''}`;
}

[serviceSelect, hoursInput, ovenInput, suppliesInput, frequencySelect].forEach((el) => {
  el.addEventListener('input', updateQuote);
  el.addEventListener('change', updateQuote);
});

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  updateQuote();

  const booking = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    service: getServiceName(),
    frequency: frequencySelect.value,
    hours: hoursInput.value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    address: document.getElementById('address').value,
    total: quoteTotal.textContent,
    createdAt: new Date().toISOString()
  };

  const bookings = JSON.parse(localStorage.getItem('nestlynBookings') || '[]');
  bookings.unshift(booking);
  localStorage.setItem('nestlynBookings', JSON.stringify(bookings));

  successMessage.hidden = false;
  bookingForm.reset();
  hoursInput.value = 3;
  frequencySelect.value = 'Weekly';
  document.getElementById('time').value = '10:00';
  updateQuote();
});

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
document.getElementById('date').min = `${yyyy}-${mm}-${dd}`;
year.textContent = yyyy;
updateQuote();
