using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace GameLogger.Services
{
    public static class IgdbService
    {
        private static readonly HttpClient _httpClient = new();
        private static string? _accessToken;
        private static DateTime _tokenExpiry;

        private static readonly string ClientId = "YOUR_TWITCH_CLIENT_ID";
        private static readonly string ClientSecret = "YOUR_TWITCH_CLIENT_SECRET";

        static IgdbService()
        {
            _httpClient.BaseAddress = new Uri("https://api.igdb.com/v4/");
        }

        private static async Task EnsureAccessTokenAsync()
        {
            if (_accessToken != null && DateTime.Now < _tokenExpiry)
            {
                return;
            }

            using var tokenClient = new HttpClient();
            var tokenRequest = new HttpRequestMessage(
                HttpMethod.Post,
                "https://id.twitch.tv/oauth2/token"
            )
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    { "client_id", ClientId },
                    { "client_secret", ClientSecret },
                    { "grant_type", "client_credentials" }
                })
            };

            var response = await tokenClient.SendAsync(tokenRequest);
            response.EnsureSuccessStatusCode();

            var tokenResponse = await response.Content.ReadFromJsonAsync<TokenResponse>();
            _accessToken = tokenResponse?.access_token;
            _tokenExpiry = DateTime.Now.AddHours(1).AddMinutes(-5);
        }

        public static async Task<string?> SearchGameCoverAsync(string title)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(title) || ClientId == "YOUR_TWITCH_CLIENT_ID")
                {
                    return null;
                }

                await EnsureAccessTokenAsync();

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Client-ID", ClientId);
                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", _accessToken);

                var query = $"fields cover.url,name; search \"{title}\"; limit 1;";
                var content = new StringContent(query, Encoding.UTF8, "text/plain");

                var response = await _httpClient.PostAsync("games", content);

                if (!response.IsSuccessStatusCode)
                {
                    return null;
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var games = JsonSerializer.Deserialize<IgdbGame[]>(jsonResponse,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (games?.Length > 0 && games[0].Cover != null)
                {
                    var imageId = games[0].Cover.Url?.Split('/').Last()?.Replace("jpg", "png");
                    return $"https://images.igdb.com/igdb/image/upload/t_cover_big/{imageId}";
                }
            }
            catch
            {
                // Silently fail - user can manually enter cover URL
            }

            return null;
        }

        private class TokenResponse
        {
            public string access_token { get; set; } = string.Empty;
            public int expires_in { get; set; }
            public string token_type { get; set; } = string.Empty;
        }

        private class IgdbGame
        {
            public string Name { get; set; } = string.Empty;
            public IgdbCover? Cover { get; set; }
        }

        private class IgdbCover
        {
            public string Url { get; set; } = string.Empty;
        }
    }
}
