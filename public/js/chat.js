const socket = io();

/**all createTemplate function are stored in template.js*/
/**DOM elements */
const $msgForm = document.querySelector('.msg__form');
const $msgFormInput = document.querySelector('.input');
const $sendBtn = document.querySelector('.send__btn');
const $locBtn = document.querySelector('.location__btn');
const $msgContainer = document.querySelector('.msg__container');
const $sidebar = document.querySelector('.chat__sidebar');
const $mobileActiveIcon = document.querySelector('.mobile__icon');

// scraping data from url ex->http://localhost:3000/chat.html?username=la+surname&room=ladav
const { username, room } = (() => {
    let queryString = location.search;                    // queryString = ?username=la+surname&room=ladav
    queryString = queryString.replace('?username=', '');  // queryString = la+surname&room=ladav
    queryString = queryString.replace('room=', '');       // queryString = la+surname&ladav
    let [username, room] = queryString.split('&');        // ["la+surname", "ladav"]
    username = username.replace(/\+.*/, '');              // username = 'la' (in case user enter a display name like this-> "la dav nav cadsdf")
    room = room.replace(/\+.*/, '');   

    if(username.charAt(10) !== '') {
        username = username.substr(0, 10) + '...';
    }

    if(room.charAt(10) !== '') {
        room = room.substr(0, 10) + '...';
    }

    return { username, room };
})();

// auto scrolling message container
const autoScroll = () => {
    // fetch the last message
    const $lastMsg = $msgContainer.lastElementChild;

    // height of the last message
    const extraMargin = getComputedStyle($lastMsg).marginBottom;    // margin is proveided after each msg
    const lastMsgHeight = $lastMsg.offsetHeight + parseInt(extraMargin);

    // height of the visible container
    const visibleContainerHeight = $msgContainer.offsetHeight;

    // height of whole scrollable container
    const scrollContainerHeight = $msgContainer.scrollHeight;

    // how far i have scrolled from the top
    const scrollHeight = visibleContainerHeight + Math.ceil($msgContainer.scrollTop) + 2;
    if (scrollContainerHeight - lastMsgHeight <= scrollHeight) {
        $msgContainer.scrollTop = $msgContainer.scrollHeight;
    }
};

socket.on('message', (msg) => {
    const $msgTemplate = createMsgTemplate(msg);  

    $msgContainer.insertAdjacentHTML('beforeend', $msgTemplate);
    autoScroll();
});

socket.on('locationMessage', (msg) => {
    const $locTemplate = createLocTemplate(msg);

    $msgContainer.insertAdjacentHTML('beforeend', $locTemplate);
    autoScroll();
});

socket.on('roomData', ({ room, users }) => {
    // cleaning the previous output
    $sidebar.textContent = ''

    const $sideBarTemplate =  createSidebarTemplate(room, users );

    $sidebar.insertAdjacentHTML('afterbegin', $sideBarTemplate);
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

$sendBtn.addEventListener('click', (event) => {
    event.preventDefault();

    $sendBtn.setAttribute('disabled', 'disabled');
    const msgText = $msgForm.elements.message.value;

    if(msgText !== '') {
        socket.emit('sendMessage', msgText, () => {
            $msgFormInput.value = '';
            $msgFormInput.focus();
            
            console.log('msg Delivered!');
        });
    } 
    $sendBtn.removeAttribute('disabled');
});

// sharing location
$locBtn.addEventListener('click', () => {
    event.preventDefault();

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported in your browser!');
    }

    $locBtn.setAttribute('disabled', 'disabled');

    setTimeout(() => {      // in case it take too long!
        if ($locBtn.getAttribute('disabled') === 'disabled') {
            alert(' can\'t fetch Geolocation!');
            $locBtn.removeAttribute('disabled');
            return; 
        }
    }, 5000);

    navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        };

        socket.emit('sendLocation', coords , () => {
            $locBtn.removeAttribute('disabled');
            console.log('Location Shared!');
        });
    });
});


//  on click listener for activeicon
// hide or show active user in mobile view
$mobileActiveIcon.addEventListener('click', () => {
    const activeUsers = document.querySelector('.active__users');

    activeUsers.classList.toggle('mobile__user--active');
    let isActive = false;
    active__users.classList.map(_=> console.log(_));
    for(let clas of activeUsers.classList) {
        if(clas === 'mobile__user--active') isActive = true;
    }
    
    if(isActive){
        backdropListener.style.display = 'block';
    }
    else {
        backdropListener.style.display = 'none';
    }
});

window.onbeforeunload = function() {
    return 'if you left this page, you have to join the room again!';
};


// on click listener for backdrop
const backdropListener = document.querySelector('.backdrop');
backdropListener.addEventListener('click', () => {
    backdropListener.style.display = 'none';
    document.querySelector('.active__users').classList.toggle('mobile__user--active');
})
