import React, {useState} from 'react';
import {ErrorBoundary, withProfiler} from '@sentry/react';
import {Store} from './store/Store';
import MovieView from './components/MovieView';
import './App.css';

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
      <div id="App">
        <h1 className="App-title">{title}</h1>
        <hr className="App-title-hr" />
        <ErrorBoundary fallback={<p>Well shit, we really fucked up.</p>}>
          <MovieView />
        </ErrorBoundary>
        <hr className="App-footer-hr" />
        <footer className="App-footer">
          <p>
            <a href="https://github.com/asherfoster/wtfsiw">Github</a> -{' '}
            <a href="https://asherfoster.com/things/whatthefuckshouldiwatch">
              About
            </a>{' '}
            - <a href="https://simpleanalytics.com/wtfsiw.xyz">Stats</a>
          </p>
          <p>
            Made by <a href="https://asherfoster.com">Asher Foster</a> for no
            fucking reason. This product uses the TMDb API but is not endorsed
            or certified by TMDb.
          </p>
        </footer>
      </div>
    </Store>
  );
};

export default withProfiler(App);
