# Настройка Git и отправка на GitHub

В папке уже создан файл `.gitignore`. Выполните шаги по порядку.

## 0. Установка Git (если ещё не установлен)

1. Скачайте установщик для Windows: [https://git-scm.com/download/win](https://git-scm.com/download/win).
2. Запустите установщик и пройдите шаги (можно оставить настройки по умолчанию).
3. После установки **закройте и снова откройте** терминал (PowerShell или cmd), чтобы подхватилась команда `git`.
4. Проверьте: введите в терминале `git --version` — должна отобразиться версия Git.

## 1. Локальная инициализация и первый коммит

Откройте терминал и выполните команды из папки проекта `d:\source\songlist`:

```powershell
cd d:\source\songlist

git init
git add .
git status
git commit -m "Initial commit: songlist with light/dark theme"
```

## 2. Создание репозитория на GitHub

1. Зайдите на [github.com](https://github.com) и войдите в аккаунт.
2. Нажмите **New repository** (или **+** → **New repository**).
3. Укажите имя репозитория (например, `songlist`).
4. **Не** добавляйте README, .gitignore или лицензию — репозиторий должен быть пустым.
5. Нажмите **Create repository**.

## 3. Подключение удалённого репозитория и отправка

Подставьте вместо `USERNAME` и `REPO` свой логин и имя репозитория:

```powershell
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

Если репозиторий создан с именем `songlist` и ваш логин `ikarrka`:

```powershell
git remote add origin https://github.com/ikarrka/songlist.git
git branch -M main
git push -u origin main
```

После ввода пароля (или по токену/SSH) изменения окажутся на GitHub.
