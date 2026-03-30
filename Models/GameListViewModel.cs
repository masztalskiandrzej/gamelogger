namespace GameLogger.Models
{
    public class GameListViewModel
    {
        public List<Game> Games { get; set; } = new();
        public string SearchTerm { get; set; } = string.Empty;
        public string? SelectedGenre { get; set; }
        public int? MinRating { get; set; }
        public int? MaxRating { get; set; }
        public List<string> Genres { get; set; } = new();
    }
}
