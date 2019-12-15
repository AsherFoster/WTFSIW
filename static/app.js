(function main() {
  const SOURCE_PAGE_BASE = 'https://www.themoviedb.org/movie/';
  const QUERIES = window.location.search.substr(1).split('&');
  const FLAGS = {};
  QUERIES.forEach((s) => {
    const [name, val] = s.split('=');
    FLAGS[name] = val !== 'false'
  });

  const FUCK = FLAGS.safe ? 'heck' : 'fuck';
  const titles = [
    'What should I fucking watch?!',
    'What the fuck should I watch?',
    'Fuck, what do I watch?!',
    'Try this fucking movie',
    'Fuck you, watch a movie.'
  ];
  const filters = {
    positive: {
      generic: [
        'I fucking love $ movies',
        '$ movies are the fucking best!',
        'I can\'t get enough of $ movies'
      ],
      genre: [
        '$ is the best fucking type of movie!'
      ],
      cast: [
        '$ is hot as fuck!',
      ],
      crew: [
        '$ makes the best movies!',
      ]
    },
    negative: {
      generic: [
        'Ew, fuck $',
        'Honestly, fuck $'
      ],
      genre: [
        '$ movies are fucking boring'
      ],
      cast: [
        '$ killed my fucking dog'
      ],
      crew: [
        '$ killed my fucking dog'
      ]
    }
  };

  let preferences = [];

  let app = new Vue({
    el: '#app',
    data: {
      title: conditionalFilter(pickRandom(titles)),
      movie: null,
      error: !(
        "Promise" in window &&
        "localStorage" in window
      ) ? {
        title: 'Your device is ancient as ' + FUCK,
        message: 'This website requires a modern browser, please upgrade'
      } : null,
      loading: false,
      flags: FLAGS,
      fuck: FUCK
    },
    methods: {
      reload() {
        this.loadMovie();
      },
      savePreference(action) {
        let existingPref = preferences.find(filter => filter.type === action.type && filter.id === action.id);
        if (existingPref) {
          preferences.splice(preferences.indexOf(existingPref), 1);
        }
        preferences.push({
          added: new Date().toISOString(),
          type: action.type,
          id: action.id,
          direction: action.direction
        });
        this.savePreferences();
      },
      loadMovie() {
        this.fetchMovie()
          .then((movie) => {
            movie.link = SOURCE_PAGE_BASE + movie.movie_id;
            movie.actions.map(action => {
              action.text = this.makeActionText(action);
            });
            movie.reasonText = this.makeReasonText(movie.reasons);
            movie.release_date = new Date(movie.release_date);
            this.movie = movie;
          })
          .catch(e => {
            this.error = {
              title: 'Unexpected Error',
              message: e.message
            }
          });
      },
      fetchMovie() {
        return fetch('/movie' + (FLAGS.debug ? '?debug=true' : ''), {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({preferences})
        })
          .then(res => {
            if(!res.ok) throw new Error(res.statusCode + ': Something went wrong.');
            return res.json();
          });
      },
      makeReasonText(reasons) {
        let pos = reasons.filter(r => r.direction === 1);
        if (!pos.length)
          return null;
        else
          return 'love ' + pos.map(f => f.name).join(', ');
      },
      makeActionText({type, name, direction, job}) {
        let filterTypes = direction === 1 ? filters.positive : filters.negative;
        let texts = filterTypes[type].concat(filterTypes.generic);
        let template = pickRandom(texts);
        template = conditionalFilter(template);

        if (job) {
          name = `${name} (${job})`;
        }
        return template.replace('$', name)
      },
      savePreferences() {
        localStorage.setItem('prefs', JSON.stringify(preferences));
      }
    },
    filters: {
      trim(value, len = 140) {
        if (!value || value.length < len) return value;
        return value.substr(0, len) + '...'
      },
      conditionalFilter
    }
  });

  function conditionalFilter(text) {
    return text.replace(/fuck/gi, FUCK);
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  function loadPreferences() {
    try {
      let prefsStr = localStorage.getItem('prefs');
      if (prefsStr)
        preferences = JSON.parse(prefsStr);
      else
        preferences = [];
    } catch (e) {
      console.error('prefs were invalid, resetting');
      localStorage.removeItem('prefs');
      window.location.reload();
    }
  }
  function loaded() {
    document.getElementById('app').style.display = '';
  }

  loadPreferences();

  if (FLAGS.safe)
    document.title = conditionalFilter(document.title);
  setTimeout(() => loaded(), 0);
  if(!app.error) { // If it hasn't already failed
    app.loadMovie();
  }
})();
