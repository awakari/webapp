const canvas = document.getElementById("matrix");
const context = canvas.getContext('2d');

const alphabet = '0123456789aBcDeFgHiJkLmQRsTUvWXyZ▶@$#ᕔᘎᘕᚦᚠᚱᛜᛝᛟ☑אقڜ✓±∑£₿∀∈¥¥∞∫≈≤≥⊃⊳Ⅺ¾㊷ðöëЫЙЯЮαβγδεζηθλμπρσω©༜?!⌲⌧℃⎈⏵⏯⏾▱▽◇◆◊○☀☂☆♙♡♪♫♫♬♥⚙⚠⚛⛁⛭✈✻➤§⎆₽€℀⍾☀☊☏☭♮⚖⛗⛿⛱⚿⚳⚹⏎⏚⻚㒵㓁丹书人仿体凡ꯃ¢¤µÅÄ¿æईऄसशऋॠஇౙༀ࿑ཨཀྵཛྷ༗ᤈᤞᤁᤃᵠ☯☾☈☽♯▷◺◹ⰅⰁⱍⱇⰮⰡⰐⰒ⼥⾯㒵㔹👁½⅔∰∯∮∗∑𖹃𖹕꧱ꩾ';
const fontSize = 20;
const columns = canvas.width/fontSize;

const rainDrops = [];
for( let x = 0; x < columns; x++ ) {
    rainDrops[x] = 1;
}

const draw = () => {

    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkMode) {
        context.fillStyle = 'rgba(17, 24, 39, 0.2)';
    } else {
        context.fillStyle = 'rgba(255, 255, 255, 0.2)';
    }
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#3b82f6';
    context.font = fontSize + 'px monospace';

    for(let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        context.fillText(text, i*fontSize, rainDrops[i]*fontSize);
        if(rainDrops[i]*fontSize > canvas.height && Math.random() > 0.95){
            rainDrops[i] = 0;
        }
        rainDrops[i]++;
    }
};

setInterval(draw, 100);
