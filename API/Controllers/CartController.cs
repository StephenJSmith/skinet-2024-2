using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class CartController(ICartService cartService) : BaseApiController
{
  [HttpGet]
  public async Task<ActionResult<ShoppingCart>> GetCartById(string id)
  {
    var cart = await cartService.GetCartAsync(id)
      ?? new ShoppingCart { Id = id };

    return Ok(cart);
  }

  [HttpPost]
  public async Task<ActionResult<ShoppingCart>> UpdateCart(ShoppingCart cart)
  {
    var updatedCart = await cartService.SetCartAsync(cart);
    if (updatedCart == null) return BadRequest("Problem with cart");

    return updatedCart;
  }

  [HttpDelete]
  public async Task<ActionResult> DeleteCart(string id)
  {
    var result = await cartService.DeleteCartAsnc(id);
    if (!result) return BadRequest("Problem deleting cart");

    return Ok();
  }
}
