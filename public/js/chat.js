const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormBtn = $messageForm.querySelector('button');
const $chatRoom = document.querySelector('#chat-room');
const $shareLocationBtn = document.querySelector('#share-location');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-message-template')
  .innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // Get new message element
  const $newMessage = $chatRoom.lastElementChild;

  // New message height
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $chatRoom.offsetHeight;

  // Height of messages container
  const containerHeight = $chatRoom.scrollHeight;

  // How far have I scrolled
  const scrollOffset = $chatRoom.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $chatRoom.scrollTop = $chatRoom.scrollHeight;
  }
};

socket.on('message', (data) => {
  const html = Mustache.render(messageTemplate, {
    username: data.username,
    message: data.text,
    createdAt: moment(data.createdAt).format('h:mm a'),
  });
  $chatRoom.insertAdjacentHTML('beforeend', html);
});

socket.on('chatChange', (data) => {
  const html = Mustache.render(messageTemplate, {
    username: data.username,
    message: data.text,
    createdAt: moment(data.createdAt).format('h:mm a'),
  });
  $chatRoom.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('sendLocation', (data) => {
  const html = Mustache.render(locationTemplate, {
    username: data.username,
    url: data.url,
    createdAt: moment(data.createdAt).format('h:mm a'),
  });
  $chatRoom.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, { room, users });
  $sidebar.innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // disabled
  $messageFormBtn.setAttribute('disabled', 'disabled');

  socket.emit('sendMsg', $messageFormInput.value, (error) => {
    // enabled
    $messageFormBtn.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }

    console.log('Message delivered!');
  });
});

$shareLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser!');
  }

  $shareLocationBtn.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude: lat, longitude: long } = position.coords;

    socket.emit('sendLocation', { lat, long }, (confirmation) => {
      $shareLocationBtn.removeAttribute('disabled');
      console.log(confirmation);
    });
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
