## Aplikacja webowa do efektywnego zarządzania zadaniami

Sklonuj repozytorium:

    git clone https://github.com/Nnunka/PlanIt

Przejdź do katalogu projektu:

    cd PlanIt\planit

Zainstaluj zależności:

    npm install

W katalogu głównym projektu stwórz plik .env i umieść w nim te dane:

    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=4925
    DB_NAME=planit
    JWT_SECRET=twój_tajny_klucz_jwt
    EMAIL_USER=PlanItReminder@gmail.com
    EMAIL_PASS=cytn gsvc nnar dpqk

## Tryb deweloperski (z automatycznym restartem serwera):

Uruchom aplikację za pomocą nodemon, aby automatycznie restartować serwer przy każdej zmianie:

    npm run dev

Otwórz przeglądarkę pod adresem:

    http://localhost:3000

## Tryb produkcyjny:

Uruchom aplikację bez narzędzi deweloperskich:

    npm start

Otwórz przeglądarkę pod adresem:

    http://localhost:5000
