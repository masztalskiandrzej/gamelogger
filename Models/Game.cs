namespace GameLogger.Models
{
    public class Game
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }
        public int Rating { get; set; } // 1-10
        public string? Review { get; set; }
        public DateTime DatePlayed { get; set; }
        public string? Genre { get; set; }
        public string? Platform { get; set; }
        public int PlaytimeHours { get; set; }
    }
}
