import profanity from 'leo-profanity'

profanity.add(profanity.getDictionary('ru'))
profanity.add(profanity.getDictionary('en'))

export const clean = (text) => {
  if (!text) return text

  // v
  // v
  const cleaned = profanity.clean(text)
  return cleaned.replace(/\*+/g, '*****')
}
