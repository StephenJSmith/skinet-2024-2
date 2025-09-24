using System.Text.Json;
using Core.Entities;
using Core.Interfaces;
using StackExchange.Redis;

namespace Infrastructure.Services;

public class CartService(IConnectionMultiplexer redis) : ICartService
{
  private readonly IDatabase _database = redis.GetDatabase();
  public async Task<bool> DeleteCartAsnc(string key)
  {
    return await _database.KeyDeleteAsync(key);
  }

  public async Task<ShoppingCart?> GetCartAsync(string key)
  {
    var data = await _database.StringGetAsync(key);
    var cart = data.IsNullOrEmpty
      ? null
      : JsonSerializer.Deserialize<ShoppingCart>(data!);

    return cart;
  }

  public async Task<ShoppingCart?> SetCartAsync(ShoppingCart cart)
  {
    var ttk = TimeSpan.FromDays(30);
    var serializedCart = JsonSerializer.Serialize(cart);
    var created = await _database.StringSetAsync(cart.Id, serializedCart, ttk);
    if (!created) return null;

    return await GetCartAsync(cart.Id);
  }
}
