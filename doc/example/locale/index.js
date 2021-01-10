import { Locale } from 'libux';
import en from './en.json';
import ru from './ru.json';

const locale = new Locale({
  locales: { en, ru }
});

export default function(...args) {
  return locale.t(...args);
}
