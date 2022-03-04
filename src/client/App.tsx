const App = () => (
  <div id='app' class='wrapper'>
    <h1>{title}</h1>
    <hr class='top-hr' />
    <Movie />
    <footer class='footer'>
      <p class='reasoning' v-if='movie.reasonText'>Suggested because you {{movie.reasonText}}</p>
      <hr class='footer-hr'>
        <p>
          <a href='//github.com/asherfoster/wtfsiw'>Github</a> -
          <a href='//asherfoster.com/things/whatthefuckshouldiwatch'>About</a>
          {/*<span v-if='!flags.safe'>*/}
          {/*    - <a href='?safe=true'>Stop fucking swearing</a>*/}
          {/*  </span>*/}
          <br />
            Made by Asher Foster with a fuck ton of luck.
            This product uses the TMDb API but is not endorsed or certified by TMDb.
        </p>
    </footer>
  </div>
)
