
let currentfilter = 'all';
document.getElementById('tabs').addEventListener('click', function(ev) {
    const button = ev.target.closest('.tab'); 
    if (!button) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('a'));
    button.classList.add('a');
    currentfilter = button.dataset.type;
    render();
});

function render() {
    let list = entries.slice();
    if (currentfilter !== 'all') {
        list = list.filter(e => e.type === currentfilter);
    }
    const grid = document.getElementById('grid');
    grid.innerHTML = list.map(e => ` 
        <div class="card">
        ${e.cover ? `<img src="${e.cover}" class="cardcover">` : ''}
        <h3>${e.title}</h3>
      <p>${e.type}</p>
      <p>${e.opinion}</p>
    </div>
  `).join('');
}


let entries = [];
loadfromstorage();
render();
document.getElementById('savebutton').addEventListener('click', function() {
    const title = document.getElementById('ftitle').value.trim();
    const type = document.getElementById('ftype').value;
    const opinion = document.getElementById('fopinion').value.trim()

    if (!title) {
        alert('Gimmie title');
        return;
    }

    const newpozycja = {
        id: 'e_' + Date.now(),
        title: title,
        type: type,
        opinion: opinion,
        dateadded: Date.now(),
        cover: cover
    };
    entries.push(newpozycja);
    savetostorage();
    render();
    clearform();
    document.getElementById('overlay').classList.remove('open');
});
function clearform() {
    document.getElementById('ftitle').value = '';
    document.getElementById('fopinion').value ='';
    document.getElementById('fcoverurl').value = '';
    document.getElementById('fcoverfile').value = '';
    document.getElementById('coverpreview').innerHTML = '';
    cover = null;
}
function savetostorage() {
    localStorage.setItem('entries', JSON.stringify(entries));
}
function loadfromstorage() {
    const saved = localStorage.getItem('entries');
    entries = saved ? JSON.parse(saved) : [];
}
document.getElementById('add').addEventListener('click', function() {
    document.getElementById('overlay').classList.add('open');
});

document.getElementById('closem').addEventListener('click', function() {
    document.getElementById('overlay').classList.remove('open');

});

document.getElementById('overlay').addEventListener('click', function(ev) {
    if (ev.target.id === 'overlay') {
        document.getElementById('overlay').classList.remove('open');
    }
});
let cover = null;

document.getElementById('fcoverurl').addEventListener('input', function(ev){
    const url = ev.target.value.trim();
    if (url){
         cover = url;
         document.getElementById('coverpreview').innerHTML = `<img src="${url}" style="width:80px;">`;
    }
   
});

document.getElementById('fcoverfile').addEventListener('change', function(ev){
    const file = ev.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        cover = e.target.result;
        document.getElementById('coverpreview').innerHTML = `<img src="${cover}" style="width:80px;">`;
    };
    reader.readAsDataURL(file);
});

