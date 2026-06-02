namespace backend.Models;

public class Score
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int Points { get; set; }
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
}