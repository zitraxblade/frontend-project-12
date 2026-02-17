import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      appName: 'Hexlet Chat',

      toasts: {
        loadFailed: 'Не удалось загрузить данные',
        networkError: 'Ошибка соединения',
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

        // ✅ тесты ждут текст "Ваш ник"
        yourNick: 'Ваш ник',

        username: 'Имя пользователя',
        password: 'Пароль',
        confirmPassword: 'Подтвердите пароль',
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
        sendFailed: 'Ошибка соединения',
        loadFailed: 'Не удалось загрузить данные.',
        channelNotSelected: 'Канал не выбран',

        // ✅ для тестов (лейбл инпута сообщения)
        newMessageLabel: 'Новое сообщение',

        // ✅ для aria-label на кнопке меню канала
        channelManagement: 'Управление каналом',
      },

      modals: {
        addChannelTitle: 'Добавить канал',

        // ✅ тесты часто кликают по полным словам в меню
        renameChannelTitle: 'Переименовать канал',
        removeChannelTitle: 'Удалить канал',

        // ✅ заголовок модалки rename (часто ждут именно так)
        renameChannelModalTitle: 'Переименовать канал',

        channelNameLabel: 'Имя канала',

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
    lng: 'ru',
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
  });

export default i18n;