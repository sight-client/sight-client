import { HttpContextToken } from '@angular/common/http';

export const CACHING_ENABLED_TOKEN = new HttpContextToken<boolean>(() => false);
export const RETRY_COUNT_TOKEN = new HttpContextToken(() => 3);
export const ERROR_COUNT_TOKEN = new HttpContextToken(() => 0);
