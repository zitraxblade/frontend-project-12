import profanity from 'leo-profanity'

profanity.add(profanity.getDictionary('ru'))
profanity.add(profanity.getDictionary('en'))

export const clean = text => {
  if (!text) return text

  // leo-profanity заменяет на звёздочки по длине слова,
  // а тесты ждут ровно "*****" — нормализуем любые группы звёздочек к 5.
  const cleaned = profanity.clean(text)
  return cleaned.replace(/\*+/g, '*****')
}
