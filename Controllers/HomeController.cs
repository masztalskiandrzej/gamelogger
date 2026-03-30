using Microsoft.AspNetCore.Mvc;
using GameLogger.Models;
using GameLogger.Services;

namespace GameLogger.Controllers;

public class HomeController : Controller
{
    private static List<Game> _games = new();

    public IActionResult Index()
    {
        var viewModel = new GameListViewModel
        {
            Games = _games.Where(g => g.Status == GameStatus.Completed)
                          .OrderByDescending(g => g.DatePlayed)
                          .ToList(),
            BacklogGames = _games.Where(g => g.Status == GameStatus.Backlog).ToList(),
            PlayingGames = _games.Where(g => g.Status == GameStatus.Playing).ToList(),
            Genres = _games.Select(g => g.Genre).Where(g => !string.IsNullOrEmpty(g)).Distinct().ToList()!
        };

        return View(viewModel);
    }

    public IActionResult Backlog()
    {
        var viewModel = new GameListViewModel
        {
            BacklogGames = _games.Where(g => g.Status == GameStatus.Backlog)
                                 .OrderBy(g => g.DateAdded)
                                 .ToList(),
            Genres = _games.Select(g => g.Genre).Where(g => !string.IsNullOrEmpty(g)).Distinct().ToList()!
        };

        return View(viewModel);
    }

    [HttpGet]
    public IActionResult EditGame(int id)
    {
        var game = _games.FirstOrDefault(g => g.Id == id);
        if (game == null)
        {
            return NotFound();
        }

        return PartialView("_GameForm", game);
    }

    [HttpPost]
    public IActionResult EditGame(Game game)
    {
        if (ModelState.IsValid)
        {
            var existingGame = _games.FirstOrDefault(g => g.Id == game.Id);
            if (existingGame != null)
            {
                existingGame.Title = game.Title;
                existingGame.CoverImageUrl = game.CoverImageUrl;
                existingGame.Rating = game.Rating;
                existingGame.Review = game.Review;
                existingGame.Genre = game.Genre;
                existingGame.Platform = game.Platform;
                existingGame.PlaytimeHours = game.PlaytimeHours;
                existingGame.Status = game.Status;

                if (existingGame.Status == GameStatus.Completed && existingGame.DatePlayed == default)
                {
                    existingGame.DatePlayed = DateTime.Now;
                }
            }

            return Json(new { success = true });
        }

        return Json(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }

    [HttpPost]
    public IActionResult AddGame(Game game)
    {
        if (ModelState.IsValid)
        {
            game.Id = _games.Any() ? _games.Max(g => g.Id) + 1 : 1;
            game.DateAdded = DateTime.Now;
            game.DatePlayed = game.Status == GameStatus.Completed ? DateTime.Now : default;
            _games.Add(game);

            return Json(new { success = true, gameId = game.Id });
        }

        return Json(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }

    [HttpPost]
    public IActionResult DeleteGame(int id)
    {
        var game = _games.FirstOrDefault(g => g.Id == id);
        if (game != null)
        {
            _games.Remove(game);
        }
        return Json(new { success = true });
    }

    [HttpPost]
    public IActionResult ToggleBacklog(int id)
    {
        var game = _games.FirstOrDefault(g => g.Id == id);
        if (game != null)
        {
            game.Status = game.Status == GameStatus.Backlog ? GameStatus.Playing : GameStatus.Backlog;
            if (game.Status == GameStatus.Playing && game.DatePlayed == default)
            {
                game.DatePlayed = DateTime.Now;
            }
        }
        return Json(new { success = true, newStatus = game?.Status.ToString() });
    }

    [HttpPost]
    public IActionResult ChangeStatus(int id, GameStatus newStatus)
    {
        var game = _games.FirstOrDefault(g => g.Id == id);
        if (game != null)
        {
            game.Status = newStatus;
            if (newStatus == GameStatus.Playing && game.DatePlayed == default)
            {
                game.DatePlayed = DateTime.Now;
            }
            if (newStatus == GameStatus.Completed)
            {
                game.DatePlayed = DateTime.Now;
            }
        }
        return Json(new { success = true, newStatus = game?.Status.ToString() });
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
        var completedGames = _games.Where(g => g.Status == GameStatus.Completed).ToList();
        var viewModel = new StatsViewModel
        {
            TotalGames = completedGames.Count,
            AverageRating = completedGames.Any() ? completedGames.Average(g => g.Rating) : 0,
            TotalPlaytimeHours = completedGames.Sum(g => g.PlaytimeHours),
            MostPlayedGenre = completedGames
                .Where(g => !string.IsNullOrEmpty(g.Genre))
                .GroupBy(g => g.Genre)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault()?.Key,
            HighestRatedGame = completedGames.OrderByDescending(g => g.Rating).FirstOrDefault(),
            RecentlyPlayed = completedGames.OrderByDescending(g => g.DatePlayed).FirstOrDefault()
        };

        return PartialView("_Stats", viewModel);
    }

    [HttpGet]
    public async Task<IActionResult> FetchCover(string title)
    {
        try
        {
            var coverUrl = await IgdbService.SearchGameCoverAsync(title);
            return Json(new { success = true, coverUrl });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, error = ex.Message });
        }
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View();
    }
}
