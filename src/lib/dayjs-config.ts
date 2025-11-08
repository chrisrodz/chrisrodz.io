import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localeData from 'dayjs/plugin/localeData';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Import locales
import 'dayjs/locale/es';
import 'dayjs/locale/en';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Constants
export const DEFAULT_TIMEZONE = 'America/Puerto_Rico';
export const DATE_FORMAT_ISO = 'YYYY-MM-DD';
export const DATETIME_FORMAT_ISO = 'YYYY-MM-DDTHH:mm:ss';

export default dayjs;
