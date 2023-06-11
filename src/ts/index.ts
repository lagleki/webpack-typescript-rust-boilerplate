import '../scss/app.scss';
import './worker-controller';
import './rust';
import './ssr';
import './simple';
document.dispatchEvent(new Event('__RENDERED__'));