using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScoreController : ControllerBase
{
    private readonly AppDbContext _db;

    public ScoreController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("ranking")]
    public async Task<IActionResult> GetRanking()
    {
        var ranking = await _db.Scores
            .Include(s => s.User)
            .GroupBy(s => s.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                UserName = g.First().User.Name,
                Avatar = g.First().User.Avatar,
                SnakeSkin = g.First().User.SnakeSkin,
                BestScore = g.Max(s => s.Points),
                TotalGames = g.Count()
            })
            .OrderByDescending(x => x.BestScore)
            .Take(10)
            .ToListAsync();

        return Ok(ranking);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> SaveScore([FromBody] SaveScoreDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var score = new Score
        {
            UserId = userId,
            Points = dto.Points
        };

        _db.Scores.Add(score);
        await _db.SaveChangesAsync();

        return Ok(score);
    }
}

public record SaveScoreDto(int Points);