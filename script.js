document.getElementById('getstartedb').addEventListener('click', function() {
    window.location.href = 'library.html';
});

let currentfilter = 'all';
document.getElementById('tabs').addEventListener('click', function(ev) {
    const button = ev.target.closest('.tab'); 
    if (!button) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    button.classList.add('a');
    currentfilter = button.dataset.type;
    render();
});

function render() {
    let list = entires.slice();
    if (currentfilter !== 'all') {
        list = list.filter(e => e.type === currentfilter);
    }
}

let pozycje = [];
document.getElementById('savebutton').addEventListener('click', function() {
    const title = document.getElementById('ftitle').ariaValueMax.trim();
    const type = document.getElementById('ftype').value;
    const opinion = document.getElementByDI('fopinion').value.trim()

    if (!title) {
        alert('Gimmie title');
        return;
    }

    const newpozycja = {
        id: 'e_' + Date.now(),
        title: title,
        type: type,
        opinion: opinion;
        dateadded: Date.now()
    };
    entires.push(newpozycja);
    render();
    clearform();
});
function clearform() {
    document.getElementById('ftitle').value = '';
    document.getElementById('fopinion').value ='';
}