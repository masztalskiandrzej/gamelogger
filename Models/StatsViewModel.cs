namespace GameLogger.Models
{
    public class StatsViewModel
    {
        public int TotalGames { get; set; }
        public double AverageRating { get; set; }
        public int TotalPlaytimeHours { get; set; }
        public string? MostPlayedGenre { get; set; }
        public Game? HighestRatedGame { get; set; }
        public Game? RecentlyPlayed { get; set; }
    }
}
