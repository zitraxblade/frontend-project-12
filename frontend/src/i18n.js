import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      appName: 'Hexlet Chat',
      toasts: {
  loadFailed: 'Не удалось загрузить данные',
  networkError: 'Ошибка сети',
  channelCreated: 'Канал создан',
  channelRenamed: 'Канал переименован',
  channelRemoved: 'Канал удалён',
},

      common: {
        logout: 'Выйти',
        cancel: 'Отменить',
        send: 'Отправить',
        sending: 'Отправка…',
        save: 'Сохранить',
        saving: 'Сохранение…',
        delete: 'Удалить',
        deleting: 'Удаление…',
        loading: 'Загрузка…',
      },

      auth: {
        loginTitle: 'Вход',
        signupTitle: 'Регистрация',
        username: 'Имя пользователя',
        password: 'Пароль',
        confirmPassword: 'Подтверждение пароля',
        signIn: 'Войти',
        signUp: 'Зарегистрироваться',
        signingIn: 'Вход…',
        testUser: 'Тестовый пользователь: admin / admin',
        noAccount: 'Нет аккаунта?',
        haveAccount: 'Уже есть аккаунт?',
        registerLink: 'Регистрация',
        loginLink: 'Войти',
        wrongCreds: 'Неверные имя пользователя или пароль',
        userExists: 'Такой пользователь уже существует',
        signupFailed: 'Не удалось зарегистрироваться. Попробуйте ещё раз.',
      },

      validation: {
        required: 'Обязательное поле',
        usernameLen: 'От 3 до 20 символов',
        passwordMin: 'Не менее 6 символов',
        passwordsMustMatch: 'Пароли должны совпадать',
        mustBeUnique: 'Должно быть уникальным',
      },

      chat: {
        channels: 'Каналы',
        messagesCount: 'сообщений: {{count}}',
        messagePlaceholder: 'Введите сообщение...',
        sendFailed: 'Не удалось отправить сообщение. Проверьте соединение.',
        loadFailed: 'Не удалось загрузить данные.',
        channelNotSelected: 'Канал не выбран',
      },

      modals: {
        addChannelTitle: 'Добавить канал',
        renameChannelTitle: 'Переименовать канал',
        removeChannelTitle: 'Удалить канал',
        removeConfirm: 'Уверены, что хотите удалить канал #{{name}}?',
        createFailed: 'Не удалось создать канал. Попробуйте ещё раз.',
        renameFailed: 'Не удалось переименовать. Попробуйте ещё раз.',
        removeFailed: 'Не удалось удалить канал. Попробуйте ещё раз.',
      },

      notFound: {
        title: 'Страница не найдена',
        toHome: 'На главную',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',           // ВАЖНО: дефолтная локаль ru
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;