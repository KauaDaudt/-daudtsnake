using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    [HttpPost("pix")]
    public async Task<IActionResult> GeneratePix([FromBody] PixRequestDto dto)
    {
        var mpAccessToken = Environment.GetEnvironmentVariable("MP_ACCESS_TOKEN") 
                            ?? "seu_token_aqui";

        using var http = new HttpClient();
        http.DefaultRequestHeaders.Add("Authorization", $"Bearer {mpAccessToken}");

        var payload = new
        {
            transaction_amount = dto.Amount,
            description = "Doação pro KauaDaudt 🐍",
            payment_method_id = "pix",
            payer = new
            {
                email = dto.PayerEmail,
                first_name = "Doador"
            }
        };

        var response = await http.PostAsJsonAsync(
            "https://api.mercadopago.com/v1/payments", payload);

        if (!response.IsSuccessStatusCode)
            return BadRequest("Erro ao gerar Pix");

        var result = await response.Content.ReadFromJsonAsync<dynamic>();
        return Ok(result);
    }
}

public record PixRequestDto(decimal Amount, string PayerEmail);