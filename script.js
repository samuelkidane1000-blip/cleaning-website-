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

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_REAL_FORM_ID';

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

bookingForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  updateQuote();
  successMessage.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  const extrasList = [];
  if (ovenInput.checked) extrasList.push('Inside oven clean');
  if (suppliesInput.checked) extrasList.push('Hoover & mop provided by us');

  const booking = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    email: emailInput.value.trim(),
    service: getServiceName(),
    frequency: frequencySelect.value,
    hours: hoursInput.value,
    date: dateInput.value,
    time: timeInput.value,
    extras: extrasList.length ? extrasList.join(', ') : 'None',
    total: quoteTotal.textContent,
    createdAt: new Date().toISOString()
  };

  try {
    const formData = new FormData();
    formData.append('name', booking.name);
    formData.append('phone', booking.phone);
    formData.append('email', booking.email);
    formData.append('service', booking.service);
    formData.append('frequency', booking.frequency);
    formData.append('hours', booking.hours);
    formData.append('date', booking.date);
    formData.append('time', booking.time);
    formData.append('extras', booking.extras);
    formData.append('total', booking.total);
    formData.append('createdAt', booking.createdAt);
    formData.append('_subject', `New Nestlyn Clean booking from ${booking.name}`);

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      body: formData
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error((result && result.error) || 'Form submission failed');
    }

    const whatsappMessage = `Hi Nestlyn Clean, I'd like to book:

Service: ${booking.service}
Frequency: ${booking.frequency}
Hours: ${booking.hours}
Date: ${booking.date}
Time: ${booking.time}
Extras: ${booking.extras}
Estimated total: ${booking.total}

Name: ${booking.name}
Phone: ${booking.phone}
Email: ${booking.email}`;

    const whatsappURL = `https://wa.me/447514718173?text=${encodeURIComponent(whatsappMessage)}`;

    successMessage.innerHTML = `
      <h3>Booking Sent Successfully</h3>
      <p>Your booking has been sent successfully. WhatsApp will open to confirm it.</p>
    `;
    successMessage.hidden = false;
    successMessage.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    bookingForm.reset();
    hoursInput.value = 2;
    frequencySelect.value = 'Weekly';
    timeInput.value = '10:00';
    updateQuote();

    setTimeout(() => {
      window.open(whatsappURL, '_blank');
    }, 700);

  } catch (error) {
    console.error(error);
    successMessage.innerHTML = `
      <h3>Booking not sent</h3>
      <p>Please check your Formspree endpoint and try again, or contact us on WhatsApp: 07514 718173.</p>
    `;
    successMessage.hidden = false;
    successMessage.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm & Book';
  }
});

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');

dateInput.min = `${yyyy}-${mm}-${dd}`;
if (year) year.textContent = yyyy;
hoursInput.value = 2;
timeInput.value = '10:00';
updateQuote();
