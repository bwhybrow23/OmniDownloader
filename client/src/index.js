import * as ReactDOMClient from 'react-dom/client';
import App from './App';

import './css/styles.css';

const root = ReactDOMClient.createRoot(document.getElementById('root'));

root.render(<App />);