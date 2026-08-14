const TMDB_API_KEY = '258ae539774bd76e3b03092c23b75532';
const GOOGLE_AP_KEY = 'AIzaSyBLqs4H1DZkHbhboCsywbnxSEPaZlL47ZA';

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
            ${e.cover 
      ? `<img src="${e.cover}" class="cardcover">` 
      : `<div class="cardcover cardcover-placeholder">${e.title}</div>`}
        
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
    document.getElementById('coversearchresults').innerHTML = '';
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

let bookCache = {};

async function searchbookcovers(title) {
  if (!title || title.trim().length < 2) return [];
  
  const cacheKey = title.toLowerCase();
  if (bookCache[cacheKey]) {
    return bookCache[cacheKey];  
  }

  try {
    const url = 'https://www.googleapis.com/books/v1/volumes?q=' 
              + encodeURIComponent('intitle:' + title)
              + '&maxResults=15'
              + '&printType=books'
              + '&orderBy=relevance'
              + '&key=' + GOOGLE_AP_KEY;

    const response = await fetch(url);
    
    if (!response.ok) {
      console.log('Google books nie odpowiada, status:', response.status);
      return [];
    }
    
    const data = await response.json();

    if (!data.items) return [];

    const searchWords = title.toLowerCase().split(' ');

    const results = data.items
      .filter(item => item.volumeInfo.imageLinks && item.volumeInfo.imageLinks.thumbnail)
      .filter(item => {
        const itemTitle = item.volumeInfo.title.toLowerCase();
        return searchWords.every(word => itemTitle.includes(word));
      })
      .slice(0, 5)
      .map(item => ({
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors ? item.volumeInfo.authors[0] : '',
        cover: item.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')
      }));

    bookCache[cacheKey] = results; 
    return results;

  } catch (err) {
    console.log('Błąd wyszukiwania książek:', err);
    return [];
  }
}

async function searchmoviecovers(title, type) {
  if (!title || title.trim().length < 2) return [];
  try {
    const endpoint = type === 'Movie' ? 'movie' : 'tv';
    const url = 'https://api.themoviedb.org/3/search/' + endpoint 
              + '?api_key=' + TMDB_API_KEY 
              + '&query=' + encodeURIComponent(title)
              + '&language=en-US';

    const response = await fetch(url);
    const data = await response.json();

    return data.results
      .filter(item => item.poster_path)
      .slice(0, 5)
      .map(item => ({
        title: type === 'Movie' ? item.title : item.name,
        author: item.release_date || item.first_air_date || '',
        cover: 'https://image.tmdb.org/t/p/w500' + item.poster_path
      }));
  } catch (err) {
    console.log('Error, sorry lad:', err);
    return [];
  }
}


let searchtimeout;

document.getElementById('ftitle').addEventListener('input', function(){
    clearTimeout(searchtimeout);

    searchtimeout = setTimeout(async function(){
        const title = document.getElementById('ftitle').value.trim();
        const type = document.getElementById('ftype').value;

        if (title.lengh < 2) {
            document.getElementById('coversearchresults').innerHTML = '';
            return;

        }
        const resultsbox = document.getElementById('coversearchresults');
        resultsbox.innerHTML = 'Searching...'

        let results = [];
        if (type === 'Book') {
            results = await searchbookcovers(title);    
              } else {
            results = await searchmoviecovers(title, type);
              }
        if (results.length === 0) {
            resultsbox.innerHTML = 'Nothing found, sorry lad';
            return;
                }

            resultsbox.innerHTML = results.map((r, i) => `
              <div class="coverchoice" data-index="${i}">
        <img src="${r.cover}">
        <div class="coverchoice-text">
          <strong>${r.title}</strong>
          ${r.author ? `<span>${r.author}</span>` : ''}
        </div>
      </div>
      `).join('');
      window.lastcoverresults = results;
    }, 500);
});

document.getElementById('coversearchresults').addEventListener('click', function(ev) {
const choice = ev.target.closest('.coverchoice');
if (!choice) return;

const index = parseInt(choice.dataset.index);
const picked = window.lastcoverresults[index];

cover = picked.cover;
document.getElementById('ftitle').value = picked.title;
document.getElementById('coverpreview').innerHTML = `<img src="${cover}" style="width:80px;">`;
document.getElementById('coversearchresults').innerHTML = '';
});

