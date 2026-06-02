using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IConfiguration _config;

    public PaymentController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("pix")]
    public async Task<IActionResult> GeneratePix([FromBody] PixRequestDto dto)
    {
        var accessToken = _config["MercadoPago:AccessToken"];

        using var http = new HttpClient();
        http.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
        http.DefaultRequestHeaders.Add("X-Idempotency-Key", Guid.NewGuid().ToString());

        var payload = new
        {
            transaction_amount = dto.Amount,
            description = "Doação pro KauaDaudt 🐍",
            payment_method_id = "pix",
            payer = new
            {
                email = dto.PayerEmail,
                first_name = "Doador",
                last_name = "DaudtSnake"
            }
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await http.PostAsync("https://api.mercadopago.com/v1/payments", content);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            return BadRequest(new { error = "Erro ao gerar Pix", details = responseBody });

        var result = JsonSerializer.Deserialize<object>(responseBody);
        return Ok(result);
    }
}

public record PixRequestDto(decimal Amount, string PayerEmail);