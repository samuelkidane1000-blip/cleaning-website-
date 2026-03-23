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
  successMessage.hidden = true;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  const booking = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    email: emailInput.value.trim(),
    service: getServiceName(),
    frequency: frequencySelect.value,
    hours: hoursInput.value,
    date: dateInput.value,
    time: timeInput.value,
    extras: {
      oven: ovenInput.checked,
      supplies: suppliesInput.checked
    },
    total: quoteTotal.textContent,
    createdAt: new Date().toISOString()
  };

  const bookings = JSON.parse(localStorage.getItem('nestlynBookings') || '[]');
  bookings.unshift(booking);
  localStorage.setItem('nestlynBookings', JSON.stringify(bookings));

  const extrasList = [];
  if (ovenInput.checked) extrasList.push('Inside oven clean');
  if (suppliesInput.checked) extrasList.push('Hoover & mop provided by us');

  const message = `Hi Nestlyn Clean, I'd like to book:

Service: ${booking.service}
Frequency: ${booking.frequency}
Hours: ${booking.hours}
Date: ${booking.date}
Time: ${booking.time}
Extras: ${extrasList.length ? extrasList.join(', ') : 'None'}
Estimated total: ${booking.total}

Name: ${booking.name}
Phone: ${booking.phone}
Email: ${booking.email}`;

  const whatsappURL = `https://wa.me/447514718173?text=${encodeURIComponent(message)}`;

  setTimeout(() => {
    successMessage.hidden = false;

    successMessage.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    setTimeout(() => {
      window.open(whatsappURL, '_blank');
    }, 600);

    bookingForm.reset();
    hoursInput.value = 2;
    frequencySelect.value = 'Weekly';
    timeInput.value = '10:00';

    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm & Book';

    updateQuote();
  }, 800);
});

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');

dateInput.min = `${yyyy}-${mm}-${dd}`;
year.textContent = yyyy;
hoursInput.value = 2;
timeInput.value = '10:00';
updateQuote();
