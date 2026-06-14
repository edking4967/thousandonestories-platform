# React in Wordpress?

 https://www.reddit.com/r/reactjs/comments/15s4f0y/what_is_the_logic_behind_integrating_react_with/


 Yeah! So, really all you need to do is enqueue your javascript file, but include ['wp-element'], as one of the dependencies.

wp_enqueue_script( 'my-react-app', get_template_directory_uri() . '/js/react-app.js', ['wp-element'], '1.0.0', true );

That causes WordPress to load up react in the page head. You can do this in the theme, although I generally do it as a plugin, (but that's a separate topic in itself, really)

Then you just make a react app in the JS file:

```
import { App } from './app'; // or you could just include all the stuff in one file
//------------------------------------------------------------
const sectionElement = document.getElementById('react-app');
try {ReactDOM.render(<App />, sectionElement);}
catch (error) {console.warn('Error setting up react application:', error);}

```

And then in one of the template files all you need to do is include the div with the id:

```
?><div id="react-app"></div><?php

``` 
