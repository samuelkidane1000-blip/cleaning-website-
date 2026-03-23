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
document.getElementById("bookingForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const service = document.getElementById("service").selectedOptions[0].text;
  const frequency = document.getElementById("frequency").value;
  const hours = document.getElementById("hours").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const total = document.getElementById("quoteTotal").textContent;

  const extras = [];
  if (document.getElementById("oven").checked) extras.push("Inside oven clean");
  if (document.getElementById("supplies").checked) extras.push("Hoover & mop provided by us");

  const message = `Hi Nestlyn Clean, I'd like to book:

Service: ${service}
Frequency: ${frequency}
Hours: ${hours}
Date: ${date}
Time: ${time}
Extras: ${extras.length ? extras.join(", ") : "None"}
Estimated total: ${total}

Name: ${name}
Phone: ${phone}
Email: ${email}`;

  const whatsappURL = `https://wa.me/447514718173?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, "_blank");
});
