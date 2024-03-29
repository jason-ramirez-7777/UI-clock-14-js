function addLegend(hour) {
    let dial = document.getElementById('dial');
    let element = document.createElement("DIV");
    element.classList.add("legendsContainer");
    let innerElement = document.createElement("DIV");
    element.style.position = "absolute";
    innerElement.classList.add("legends");
    let degree = hour * 30;
    element.style.transform = `rotate(${degree}deg)`;
    dial.appendChild(element);
    element.appendChild(innerElement);
}

for (let i = 0; i < 12; i++) {
    addLegend(i + 1);
}

function updateTime() {
    let date = new Date();
    let milliseconds = date.getMilliseconds();

    // next tik's time, tries to be close to 1000
    // if current ms is 007, then wait for 903 ms
    // if current ms is 990, then wait for 1000 + 10 ms before updating time.
    // the minimum waiting is 500ms, maximum waiting is 1500ms. 
    // This avoids the sudden jerky animation in the beginning for caliberation.
    let lag = milliseconds < 500 ? milliseconds : milliseconds - 1000;

    let nextTime = 1000 - lag;

    // This is better than setInterval (which can be slowed down by the browser due to inactivity)
    // If two devices have same time, their clocks will visually together.
    setTimeout(() => {
        updateTime();
    }, nextTime);

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let secondsRounded = Math.round(seconds + milliseconds / 1000);
    // because of rounding 60 is possible. But it is atmost 1 second different from seconds

    let hourRotation = 30 * hours + minutes / 2 + seconds / 120;
    let minuteRotation = 6 * minutes + secondsRounded / 10;
    let secondRotation = 6 * secondsRounded;

    document.documentElement.style.setProperty('--rotation-angle-hour', `${hourRotation}deg`);
    document.documentElement.style.setProperty('--rotation-angle-minute', `${minuteRotation}deg`);
    document.documentElement.style.setProperty('--rotation-angle-second', `${secondRotation}deg`);
}

updateTime();
let styleIndex = 0;

styles = [
    'pill', // Rounded corners
    'oval',
    'roman', // Roman numerals
    'ank', // ank means numbers
    'pike', // pointy design (polygon)
];

function loadStyleSheet(path) {
    var head = document.head; // Selecting the head element
    var link = document.createElement('link'); // Creating a link element

    link.rel = 'stylesheet'; // Setting relation to stylesheet
    link.type = 'text/css'; // Setting the type of the link element
    link.href = path; // Setting the path of the stylesheet

    head.appendChild(link); // Appending the link element to the head
}

styles.map((name) => { loadStyleSheet(`style-${name}.css`); })

function applyStyle(styleName, preventPush = false) {
    document.title = `Clock - ${styleName} style`;
    document.getElementById('theme-container').className = styleName;
    localStorage.setItem('style', styleName);
    if (!preventPush) {
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('style', styleName);
        history.pushState({}, '', currentUrl);
    }
}


function nextStyle() {
    styleIndex = (styleIndex + 1) % styles.length;
    applyStyle(styles[styleIndex]);
}

function getStyleFromUrlOrDefault() {
    const urlParams = new URLSearchParams(window.location.search);
    let style = urlParams.get('style');

    if (!style) {
        style = localStorage.getItem('style') || styles[0];
    }

    let index = styles.indexOf(style);
    if (index == -1) {
        index = 0;
        style = styles[0]; // Fallback to default if not found
    }
    return style;
}

function applyStyleBoot() {
    let style = getStyleFromUrlOrDefault();
    styleIndex = styles.indexOf(style);
    applyStyle(style);
}


applyStyleBoot();

document.addEventListener('click', nextStyle);

window.addEventListener('popstate', function (event) {
    // When the user navigates back/forward, read the style from the URL and apply it
    let style = getStyleFromUrlOrDefault();
    applyStyle(style, true);
});
