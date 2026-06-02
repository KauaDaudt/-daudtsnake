using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.GoogleId == dto.GoogleId);

        if (user == null)
        {
            user = new User
            {
                GoogleId = dto.GoogleId,
                Email = dto.Email,
                Name = dto.Name,
                Avatar = "duck",
                SnakeSkin = "green"
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        var token = GenerateJwt(user);
        return Ok(new { token, user });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.Name = dto.Name;
        user.Avatar = dto.Avatar;
        user.SnakeSkin = dto.SnakeSkin;
        await _db.SaveChangesAsync();

        return Ok(user);
    }

    private string GenerateJwt(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record GoogleLoginDto(string GoogleId, string Email, string Name);
public record UpdateProfileDto(string Name, string Avatar, string SnakeSkin);