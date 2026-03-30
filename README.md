# GameLogger 🎮

Osobista biblioteka gier z możliwością śledzenia postępów, oceniania i zarządzania backlogiem.

## ✨ Funkcje

- **📋 Backlog** - lista gier "do ogrania"
- **🎮 Śledzenie postępów** - trzy stany gry: Backlog → W trakcie → Ukończona
- **✏️ Pełna edycja** - modyfikacja wszystkich pól gry
- **🖼️ Automatyczne okładki** - integracja z IGDB API (Twitch)
- **⭐ Oceny i recenzje** - system ocen 1-10 z polami na recenzje
- **📊 Statystyki** - podsumowanie rozgrywki

## 🚀 Szybki start

### Wymagania
- .NET 11.0 SDK
- (Opcjonalnie) Konto Twitch Dev dla IGDB API

### Instalacja

```bash
# Sklonuj repozytorium
git clone https://github.com/twoj-uzytkownik/GameLogger.git
cd GameLogger

# Uruchom aplikację
dotnet run
```

Aplikacja będzie dostępna pod: `http://localhost:5301`

## 🔧 Konfiguracja IGDB API (opcjonalne)

Aby automatycznie pobierać okładki gier:

1. Zarejestruj aplikację na [Twitch Dev Console](https://dev.twitch.tv/console)
2. Utwórz nową aplikację i skopiuj `Client ID` oraz `Client Secret`
3. Zaktualizuj `Services/IgdbService.cs`:
   ```csharp
   private static readonly string ClientId = "TWOJE_CLIENT_ID";
   private static readonly string ClientSecret = "TWOJE_CLIENT_SECRET";
   ```

## 📖 Użycie

### Dodawanie gry

1. Kliknij "Dodaj Grę"
2. Wybierz status:
   - **📋 Backlog** - do ogrania w przyszłości
   - **🎮 W trakcie** - aktualnie gram
   - **🏆 Ukończona** - ukończona gra
3. Wypełnij dane (tytuł, gatunek, platforma, ocena...)
4. Kliknij 🔍 by wyszukać okładkę z IGDB
5. Zapisz grę

### Zarządzanie backlogiem

1. Przejdź do zakładki **Backlog**
2. Kliknij **Start** aby rozpocząć grę (przeniesie do "W trakcie")
3. Kliknij **Ukończ** aby przenieść do ukończonych gier

### Edycja gry

Każda gra ma przycisk **Edytuj** ✏️ który pozwala modyfikować wszystkie dane.

## 🛠️ Tech stack

- ASP.NET Core 11.0
- Razor Pages
- Bootstrap 5
- IGDB API (Twitch)
- Vanilla JavaScript

## 📁 Struktura projektu

```
GameLogger/
├── Controllers/
│   └── HomeController.cs    # Główny kontroler
├── Models/
│   ├── Game.cs              # Model gry
│   ├── GameStatus.cs        # Enum statusów
│   ├── GameListViewModel.cs
│   └── StatsViewModel.cs
├── Services/
│   └── IgdbService.cs       # Serwis IGDB API
├── Views/
│   ├── Home/
│   │   ├── Index.cshtml     # Główna strona
│   │   ├── Backlog.cshtml   # Widok backlogu
│   │   ├── _GameForm.cshtml # Formularz dodawania/edycji
│   │   └── _Stats.cshtml
│   └── Shared/
│       └── _Layout.cshtml
├── wwwroot/
│   ├── css/site.css         # Style aplikacji
│   └── js/site.js           # Funkcje JS
└── appsettings.json         # Konfiguracja
```

## 🎨 Statusy gier

| Status | Kolor | Opis |
|--------|-------|------|
| Backlog | Cyan | Gra do ogrania w przyszłości |
| Playing | Fioletowy | Aktualnie gram |
| Completed | Zielony | Ukończona gra |

## 📝 Planowane funkcje

- [ ] Baza danych (SQLite/PostgreSQL)
- [ ] Autentykacja użytkowników
- [ ] Eksport/Import danych
- [ ] Statystyki zaawansowane
- [ ] Tagi i kategorie
- [ ] Integracja z Steam API

## 📄 Licencja

MIT License - skorzystaj z projektu dowolnie.

---

Made with ❤️ for gamers
