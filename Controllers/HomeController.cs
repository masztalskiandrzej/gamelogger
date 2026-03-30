using Microsoft.AspNetCore.Mvc;
using GameLogger.Models;

namespace GameLogger.Controllers;

public class HomeController : Controller
{
    private static List<Game> _games = GetSampleGames();

    public IActionResult Index()
    {
        var viewModel = new GameListViewModel
        {
            Games = _games.OrderByDescending(g => g.DatePlayed).ToList(),
            Genres = _games.Select(g => g.Genre).Where(g => !string.IsNullOrEmpty(g)).Distinct().ToList()!
        };

        return View(viewModel);
    }

    [HttpPost]
    public IActionResult AddGame(Game game)
    {
        if (ModelState.IsValid)
        {
            game.Id = _games.Any() ? _games.Max(g => g.Id) + 1 : 1;
            game.DatePlayed = DateTime.Now;
            _games.Add(game);
            return RedirectToAction(nameof(Index));
        }

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public IActionResult DeleteGame(int id)
    {
        var game = _games.FirstOrDefault(g => g.Id == id);
        if (game != null)
        {
            _games.Remove(game);
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public IActionResult UpdateRating(int id, int rating)
    {
        var game = _games.FirstOrDefault(g => g.Id == id);
        if (game != null)
        {
            game.Rating = rating;
        }
        return Json(new { success = true });
    }

    public IActionResult Stats()
    {
        var viewModel = new StatsViewModel
        {
            TotalGames = _games.Count,
            AverageRating = _games.Any() ? _games.Average(g => g.Rating) : 0,
            TotalPlaytimeHours = _games.Sum(g => g.PlaytimeHours),
            MostPlayedGenre = _games
                .Where(g => !string.IsNullOrEmpty(g.Genre))
                .GroupBy(g => g.Genre)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault()?.Key,
            HighestRatedGame = _games.OrderByDescending(g => g.Rating).FirstOrDefault(),
            RecentlyPlayed = _games.OrderByDescending(g => g.DatePlayed).FirstOrDefault()
        };

        return PartialView("_Stats", viewModel);
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View();
    }

    private static List<Game> GetSampleGames()
    {
        return new List<Game>
        {
            new Game
            {
                Id = 1,
                Title = "The Witcher 3: Wild Hunt",
                CoverImageUrl = "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.png",
                Rating = 10,
                Review = "Jedna z najlepszych gier RPG w historii. Świetna fabuła, postacie i świat.",
                DatePlayed = DateTime.Now.AddDays(-5),
                Genre = "RPG",
                Platform = "PC",
                PlaytimeHours = 150
            },
            new Game
            {
                Id = 2,
                Title = "Elden Ring",
                CoverImageUrl = "https://images.igdb.com/igdb/image/upload/t_cover_big/4xFzdkBdhxk1sVp4vXXpWw.png",
                Rating = 9,
                Review = "Niesamowity świat do eksploracji. Trudny, ale satysfakcjonujący.",
                DatePlayed = DateTime.Now.AddDays(-2),
                Genre = "Action RPG",
                Platform = "PC",
                PlaytimeHours = 85
            },
            new Game
            {
                Id = 3,
                Title = "Hades",
                CoverImageUrl = "https://images.igdb.com/igdb/image/upload/t_cover_big/pO38WoP4QhcmxeFxEvE8.png",
                Rating = 9,
                Review = "Doskonały roguelike z świetną fabułą.",
                DatePlayed = DateTime.Now.AddDays(-1),
                Genre = "Roguelike",
                Platform = "PC",
                PlaytimeHours = 45
            },
            new Game
            {
                Id = 4,
                Title = "Cyberpunk 2077",
                CoverImageUrl = "https://images.igdb.com/igdb/image/upload/t_cover_big/tb1s3h6gfrifh0yvx7nt.png",
                Rating = 8,
                Review = "Po aktualizacjach stała się świetna gra. Night City jest niesamowite.",
                DatePlayed = DateTime.Now.AddDays(-10),
                Genre = "RPG",
                Platform = "PC",
                PlaytimeHours = 70
            },
            new Game
            {
                Id = 5,
                Title = "Baldur's Gate 3",
                CoverImageUrl = "https://images.igdb.com/igdb/image/upload/t_cover_big/4pT6FgghhkxK8VTzBJf6vN.png",
                Rating = 10,
                Review = "Arcydzieło. D&D w najlepszej formie.",
                DatePlayed = DateTime.Now.AddDays(-3),
                Genre = "RPG",
                Platform = "PC",
                PlaytimeHours = 120
            }
        };
    }
}
