import React, {useState} from 'react';
import {Store} from './store/Store';
import MovieView from './components/MovieView';

const TITLES = [
  'What should I fucking watch?!',
  'What the fuck should I watch?',
  'Fuck, what do I watch?!',
  'Try this fucking movie',
  'Fuck you, watch a movie.',
];

const App = () => {
  const [title] = useState(
    () => TITLES[Math.floor(Math.random() * TITLES.length)]
  );
  return (
    <Store>
      <div>
        <h1>{title}</h1>
        <hr />
        <MovieView />
        <hr />
        <footer>
          <p>
            <a href="https://github.com/asherfoster/wtfsiw">Github</a> -
            <a href="https://asherfoster.com/things/whatthefuckshouldiwatch">
              About
            </a>
          </p>
          <p>
            Made by Asher Foster for no fucking reason. This product uses the
            TMDb API but is not endorsed or certified by TMDb.
          </p>
        </footer>
      </div>
    </Store>
  );
};

export default App;
