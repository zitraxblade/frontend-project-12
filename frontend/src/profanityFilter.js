import profanity from 'leo-profanity';

// Дефолтный словарь (en).
profanity.loadDictionary('en');
profanity.loadDictionary('ru');



export const clean = (text) => profanity.clean(text);